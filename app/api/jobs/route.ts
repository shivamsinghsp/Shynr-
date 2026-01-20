import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/db';
import Job from '@/db/models/Job';

// GET /api/jobs - Get all published jobs with filtering and pagination
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);

        // Pagination
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        // Filters
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category') || '';
        const type = searchParams.get('type') || '';
        const location = searchParams.get('location') || '';
        const minSalary = parseInt(searchParams.get('minSalary') || '0');
        const maxSalary = parseInt(searchParams.get('maxSalary') || '0');

        // Build query
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = { status: 'published' };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        if (category) {
            query.category = category;
        }

        if (type) {
            query.type = type;
        }

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        if (minSalary > 0) {
            query['salary.min'] = { $gte: minSalary };
        }

        if (maxSalary > 0) {
            query['salary.max'] = { $lte: maxSalary };
        }

        // Execute query
        const [jobs, total] = await Promise.all([
            Job.find(query)
                .sort({ featured: -1, postedDate: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Job.countDocuments(query),
        ]);

        return NextResponse.json({
            success: true,
            data: jobs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch jobs' },
            { status: 500 }
        );
    }
}

// POST /api/jobs - Create a new job (Admin only)
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        // TODO: Add admin authentication check
        const body = await request.json();

        const job = await Job.create({
            ...body,
            postedDate: new Date(),
            viewCount: 0,
            applicationCount: 0,
        });

        return NextResponse.json({
            success: true,
            data: job,
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating job:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create job' },
            { status: 500 }
        );
    }
}
