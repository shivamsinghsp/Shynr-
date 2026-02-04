import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/db';
import Attendance from '@/db/models/Attendance';
import AttendanceLocation from '@/db/models/AttendanceLocation';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { startOfDay, endOfDay } from 'date-fns';

const TIMEZONE = 'Asia/Kolkata';

// GET /api/attendance - Get current user's attendance history
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if user is an employee
        const userRole = (session.user as any).role;
        if (userRole !== 'employee' && userRole !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Only employees can view attendance' },
                { status: 403 }
            );
        }

        await dbConnect();

        const userId = (session.user as any).id;
        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month');
        const year = searchParams.get('year');

        // Build date filter
        let dateFilter = {};
        if (month && year) {
            const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
            dateFilter = { date: { $gte: startDate, $lte: endDate } };
        }

        // Get attendance records
        const attendance = await Attendance.find({
            user: userId,
            ...dateFilter,
        })
            .sort({ date: -1 })
            .limit(31)
            .lean();

        // Get today's attendance (Timezone aware)
        const now = new Date();
        const istTime = toZonedTime(now, TIMEZONE);
        const istStart = startOfDay(istTime);
        const istEnd = endOfDay(istTime);
        const queryStart = fromZonedTime(istStart, TIMEZONE);
        const queryEnd = fromZonedTime(istEnd, TIMEZONE);

        const todayAttendance = await Attendance.findOne({
            user: userId,
            date: { $gte: queryStart, $lt: queryEnd }
        }).lean();

        // Get all active locations for reference
        const locations = await AttendanceLocation.find({ isActive: true }).lean();

        return NextResponse.json({
            success: true,
            data: {
                attendance,
                todayAttendance,
                locations,
            },
        });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch attendance' },
            { status: 500 }
        );
    }
}
