import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/db';
import ActivityLog from '@/db/models/ActivityLog';

// GET /api/admin/activity-logs - Get activity logs (Super Admin only)
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const userRole = (session?.user as any)?.role;

        // Only Super Admin can view activity logs
        if (!session?.user || userRole !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized - Super Admin access required' },
                { status: 403 }
            );
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const actionFilter = searchParams.get('action');
        const entityTypeFilter = searchParams.get('entityType');
        const userRoleFilter = searchParams.get('userRole');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Build query
        const query: any = {};

        if (actionFilter) {
            query.action = actionFilter;
        }
        if (entityTypeFilter) {
            query.entityType = entityTypeFilter;
        }
        if (userRoleFilter) {
            query.userRole = userRoleFilter;
        }
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                query.createdAt.$lte = new Date(endDate);
            }
        }

        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            ActivityLog.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            ActivityLog.countDocuments(query),
        ]);

        return NextResponse.json({
            success: true,
            data: logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch activity logs' },
            { status: 500 }
        );
    }
}
