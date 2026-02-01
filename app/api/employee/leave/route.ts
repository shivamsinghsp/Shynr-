import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/db';
import LeaveRequest from '@/db/models/LeaveRequest';

// GET - Get employee's leave requests
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is employee or admin
        const userRole = (session.user as any).role;
        if (userRole !== 'employee' && userRole !== 'admin') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        // Pagination Sanitization
        let page = parseInt(searchParams.get('page') || '1');
        let limit = parseInt(searchParams.get('limit') || '20');

        // Ensure bounds
        page = Math.max(1, isNaN(page) ? 1 : page);
        limit = Math.max(1, Math.min(50, isNaN(limit) ? 20 : limit)); // Cap limit at 50

        // ObjectId Correctness
        // Determine whose leaves to fetch
        // Employees see their own, Admins might see implied employee or their own? 
        // Based on original code: const query: any = { employee: session.user.id };
        // This implies fetching "my" leaves.
        // We must ensure session.user.id is cast to ObjectId if filtering/aggregating

        const query: any = { employee: session.user.id };

        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            query.status = status;
        }

        const skip = (page - 1) * limit;

        const [leaves, total] = await Promise.all([
            LeaveRequest.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            LeaveRequest.countDocuments(query),
        ]);

        // Fix Aggregation ObjectId issue
        // Mongoose aggregation pipeline requires ObjectId types for matching if stored as ObjectId
        const mongoose = (await import('mongoose')).default;
        const employeeId = new mongoose.Types.ObjectId(session.user.id as string);

        // Get summary stats using aggregation
        const stats = await LeaveRequest.aggregate([
            { $match: { employee: employeeId } }, // Use objectId here
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalDays: { $sum: '$totalDays' },
                },
            },
        ]);

        const summary = {
            pending: 0,
            approved: 0,
            rejected: 0,
            totalApprovedDays: 0,
        };

        stats.forEach((stat: any) => {
            if (stat._id === 'pending') summary.pending = stat.count;
            if (stat._id === 'approved') {
                summary.approved = stat.count;
                summary.totalApprovedDays = stat.totalDays;
            }
            if (stat._id === 'rejected') summary.rejected = stat.count;
        });

        return NextResponse.json({
            success: true,
            leaves,
            summary,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error: any) {
        // Error Message Hygiene
        console.error('Error fetching leave requests:', error); // Log full error server-side
        return NextResponse.json(
            { error: 'Failed to fetch leave requests' }, // Generic client message
            { status: 500 }
        );
    }
}

// POST - Create a new leave request
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is employee
        const userRole = (session.user as any).role;
        if (userRole !== 'employee' && userRole !== 'admin') {
            return NextResponse.json({ error: 'Only employees can request leave' }, { status: 403 });
        }

        await connectDB();

        const body = await request.json();
        const { leaveType, startDate, endDate, reason } = body;

        // Validation
        if (!leaveType || !startDate || !endDate || !reason) {
            return NextResponse.json(
                { error: 'All fields are required: leaveType, startDate, endDate, reason' },
                { status: 400 }
            );
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
        }

        if (end < start) {
            return NextResponse.json(
                { error: 'End date cannot be before start date' },
                { status: 400 }
            );
        }

        // Check for overlapping leave requests
        const overlapping = await LeaveRequest.findOne({
            employee: session.user.id,
            status: { $ne: 'rejected' },
            $or: [
                { startDate: { $lte: end }, endDate: { $gte: start } },
            ],
        });

        if (overlapping) {
            return NextResponse.json(
                { error: 'You already have a leave request for overlapping dates' },
                { status: 400 }
            );
        }

        const leaveRequest = new LeaveRequest({
            employee: session.user.id,
            leaveType,
            startDate: start,
            endDate: end,
            reason,
        });

        await leaveRequest.save();

        return NextResponse.json({
            success: true,
            message: 'Leave request submitted successfully',
            leaveRequest,
        });
    } catch (error: any) {
        console.error('Error creating leave request:', error);
        return NextResponse.json(
            { error: 'Failed to create leave request' },
            { status: 500 }
        );
    }
}
