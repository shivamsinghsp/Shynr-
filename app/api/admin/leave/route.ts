import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/db';
import LeaveRequest from '@/db/models/LeaveRequest';

// GET - Get all leave requests (admin only)
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const employeeId = searchParams.get('employeeId');
        const limit = parseInt(searchParams.get('limit') || '50');
        const page = parseInt(searchParams.get('page') || '1');

        const query: any = {};
        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            query.status = status;
        }
        if (employeeId) {
            query.employee = employeeId;
        }

        const skip = (page - 1) * limit;

        const [leaves, total] = await Promise.all([
            LeaveRequest.find(query)
                .populate('employee', 'firstName lastName email')
                .populate('reviewedBy', 'firstName lastName')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            LeaveRequest.countDocuments(query),
        ]);

        // Get summary stats
        const stats = await LeaveRequest.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        const summary = { pending: 0, approved: 0, rejected: 0 };
        stats.forEach((stat: any) => {
            if (stat._id in summary) {
                summary[stat._id as keyof typeof summary] = stat.count;
            }
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
        console.error('Error fetching leave requests:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch leave requests' },
            { status: 500 }
        );
    }
}
