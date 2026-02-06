import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/db';
import Application from '@/db/models/Application';
import { canAccessAdminPanel } from '@/lib/permissions';

// GET /api/admin/applications - Get all applications for admin
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const userRole = (session?.user as any)?.role;

        if (!session?.user || !canAccessAdminPanel(userRole)) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);

        // Pagination Sanitization
        let page = parseInt(searchParams.get('page') || '1');
        let limit = parseInt(searchParams.get('limit') || '20');

        // Ensure bounds and handle NaN
        page = Math.max(1, isNaN(page) ? 1 : page);
        limit = Math.max(1, Math.min(50, isNaN(limit) ? 20 : limit)); // Cap limit

        const skip = (page - 1) * limit;
        const status = searchParams.get('status') || '';
        const jobId = searchParams.get('jobId') || '';

        // Build query
        const query: any = {};

        if (status) {
            query.status = status;
        }

        if (jobId) {
            query.job = jobId;
        }

        const [applications, total] = await Promise.all([
            Application.find(query)
                .populate('job', 'title company location')
                .populate('user', 'firstName lastName email phone profileImage')
                .sort({ appliedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Application.countDocuments(query)
        ]);

        return NextResponse.json({
            success: true,
            data: applications,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching applications for admin:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch applications' },
            { status: 500 }
        );
    }
}
