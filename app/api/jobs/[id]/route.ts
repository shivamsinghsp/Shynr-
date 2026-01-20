import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/db';
import Job from '@/db/models/Job';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/jobs/[id] - Get single job details
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        await dbConnect();

        const { id } = await params;
        const job = await Job.findById(id).lean();

        if (!job) {
            return NextResponse.json(
                { success: false, error: 'Job not found' },
                { status: 404 }
            );
        }

        // Increment view count
        await Job.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

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

// PUT /api/jobs/[id] - Update a job (Admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        await dbConnect();

        // TODO: Add admin authentication check
        const { id } = await params;
        const body = await request.json();

        const job = await Job.findByIdAndUpdate(
            id,
            { ...body, updatedAt: new Date() },
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
    } catch (error) {
        console.error('Error updating job:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update job' },
            { status: 500 }
        );
    }
}

// DELETE /api/jobs/[id] - Delete a job (Admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        await dbConnect();

        // TODO: Add admin authentication check
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
