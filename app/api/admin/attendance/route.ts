import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/db';
import Attendance from '@/db/models/Attendance';
import { fromZonedTime } from 'date-fns-tz';

const TIMEZONE = 'Asia/Kolkata';

// GET /api/admin/attendance - Get all attendance records
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const date = searchParams.get('date');
        const userId = searchParams.get('userId');
        const locationId = searchParams.get('locationId');

        // Build query
        const query: any = {};

        if (startDate && endDate) {
            // Parse dates as IST and convert to UTC for query
            const startIST = new Date(startDate + 'T00:00:00');
            const endIST = new Date(endDate + 'T23:59:59.999');
            const startUTC = fromZonedTime(startIST, TIMEZONE);
            const endUTC = fromZonedTime(endIST, TIMEZONE);
            query.date = { $gte: startUTC, $lte: endUTC };
        } else if (date) {
            // Parse date as IST and convert to UTC for query
            const targetIST = new Date(date + 'T00:00:00');
            const nextDayIST = new Date(date + 'T00:00:00');
            nextDayIST.setDate(nextDayIST.getDate() + 1);
            const startUTC = fromZonedTime(targetIST, TIMEZONE);
            const endUTC = fromZonedTime(nextDayIST, TIMEZONE);
            query.date = { $gte: startUTC, $lt: endUTC };
        }

        if (userId) {
            query.user = userId;
        }

        if (locationId) {
            query['checkInLocation.locationId'] = locationId;
        }

        const attendance = await Attendance.find(query)
            .populate('user', 'firstName lastName email profileImage')
            .sort({ date: -1, checkIn: -1 })
            .limit(100)
            .lean();

        return NextResponse.json({
            success: true,
            data: attendance,
        });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch attendance' },
            { status: 500 }
        );
    }
}
