import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/db';
import Job from '@/db/models/Job';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/admin/jobs/[id] - Get single job for editing
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const { id } = await params;
        const job = await Job.findById(id).lean();

        if (!job) {
            return NextResponse.json(
                { success: false, error: 'Job not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: job,
        });
    } catch (error) {
        console.error('Error fetching job:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch job' },
            { status: 500 }
        );
    }
}

// PUT /api/admin/jobs/[id] - Update a job
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const { id } = await params;
        const body = await request.json();

        // Get admin user ID for updatedBy
        const Admin = (await import('@/db/models/Admin')).default;
        const admin = await Admin.findOne({ email: session.user.email });

        const job = await Job.findByIdAndUpdate(
            id,
            {
                ...body,
                updatedBy: admin?._id,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        );

        if (!job) {
            return NextResponse.json(
                { success: false, error: 'Job not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: job,
        });
    } catch (error: any) {
        console.error('Error updating job:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update job' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/jobs/[id] - Delete a job
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const { id } = await params;

        const job = await Job.findByIdAndDelete(id);

        if (!job) {
            return NextResponse.json(
                { success: false, error: 'Job not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Job deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting job:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete job' },
            { status: 500 }
        );
    }
}
