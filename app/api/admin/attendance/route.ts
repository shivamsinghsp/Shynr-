import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/db';
import Attendance from '@/db/models/Attendance';

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
        const date = searchParams.get('date');
        const userId = searchParams.get('userId');
        const locationId = searchParams.get('locationId');

        // Build query
        const query: any = {};

        if (date) {
            const targetDate = new Date(date);
            targetDate.setHours(0, 0, 0, 0);
            const nextDay = new Date(targetDate);
            nextDay.setDate(nextDay.getDate() + 1);
            query.date = { $gte: targetDate, $lt: nextDay };
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
