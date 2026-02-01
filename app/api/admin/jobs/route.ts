import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/db';
import Job from '@/db/models/Job';

// GET /api/admin/jobs - Get all jobs for admin (including drafts, closed, etc.)
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
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;
        const status = searchParams.get('status') || '';
        const search = searchParams.get('search') || '';

        // Build query
        const query: any = {};

        if (status) {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
            ];
        }

        const [jobs, total] = await Promise.all([
            Job.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Job.countDocuments(query)
        ]);

        return NextResponse.json({
            success: true,
            data: jobs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching jobs for admin:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch jobs' },
            { status: 500 }
        );
    }
}

// POST /api/admin/jobs - Create a new job (Admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const body = await request.json();

        // Use the session user ID directly (already verified as admin)
        const createdById = (session.user as any).id;

        const job = await Job.create({
            ...body,
            createdBy: createdById,
            postedDate: new Date(),
            viewCount: 0,
            applicationCount: 0,
        });

        return NextResponse.json({
            success: true,
            data: job,
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating job:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create job' },
            { status: 500 }
        );
    }
}
