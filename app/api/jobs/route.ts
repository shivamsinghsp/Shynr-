import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/db';
import Job from '@/db/models/Job';

/**
 * Escape special regex characters to prevent ReDoS attacks
 */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /api/jobs - Get all published jobs with filtering and pagination
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);

        // Pagination with bounds checking
        let page = parseInt(searchParams.get('page') || '1');
        let limit = parseInt(searchParams.get('limit') || '10');

        // Ensure bounds and handle NaN
        page = Math.max(1, isNaN(page) ? 1 : page);
        limit = Math.max(1, Math.min(50, isNaN(limit) ? 10 : limit));
        const skip = (page - 1) * limit;

        // Filters - sanitized
        const search = searchParams.get('search')?.slice(0, 100) || '';
        const category = searchParams.get('category')?.slice(0, 50) || '';
        const type = searchParams.get('type')?.slice(0, 50) || '';
        const location = searchParams.get('location')?.slice(0, 100) || '';
        const minSalary = Math.max(0, parseInt(searchParams.get('minSalary') || '0'));
        const maxSalary = Math.max(0, parseInt(searchParams.get('maxSalary') || '0'));

        // Build query - only published jobs for public API
        const query: Record<string, unknown> = { status: 'published' };

        if (search) {
            const escapedSearch = escapeRegex(search);
            query.$or = [
                { title: { $regex: escapedSearch, $options: 'i' } },
                { company: { $regex: escapedSearch, $options: 'i' } },
                { description: { $regex: escapedSearch, $options: 'i' } },
            ];
        }

        if (category) {
            query.category = category;
        }

        if (type) {
            query.type = type;
        }

        if (location) {
            const escapedLocation = escapeRegex(location);
            query.location = { $regex: escapedLocation, $options: 'i' };
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

// POST /api/jobs - Create a new job (Admin only - PROTECTED)
export async function POST(request: NextRequest) {
    try {
        // AUTHENTICATION CHECK - REQUIRED
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        if ((session.user as { role?: string }).role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Admin access required' },
                { status: 403 }
            );
        }

        await dbConnect();

        const body = await request.json();

        // Validate required fields
        const { title, company, location, category, type, description, salary, shortDescription, skills, urgent, featured } = body;

        if (!title || !company || !location || !category || !type) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: title, company, location, category, type' },
                { status: 400 }
            );
        }

        // MASS ASSIGNMENT PROTECTION: Explicit whitelist
        // We reject unexpected fields by simply ignoring them.
        const jobData = {
            title: String(title).slice(0, 100),
            company: String(company).slice(0, 100),
            location: String(location).slice(0, 100),
            category: String(category).slice(0, 50),
            type: String(type).slice(0, 50),
            description: description ? String(description).slice(0, 5000) : undefined, // Limit description
            shortDescription: shortDescription ? String(shortDescription).slice(0, 200) : undefined,
            salary: {
                min: Number(salary?.min) || 0,
                max: Number(salary?.max) || 0,
                currency: String(salary?.currency || 'USD').slice(0, 10),
                period: String(salary?.period || 'yearly').slice(0, 20)
            },
            skills: Array.isArray(skills) ? skills.map(s => String(s).slice(0, 30)).slice(0, 20) : [], // Limit tags
            featured: Boolean(featured),
            urgent: Boolean(urgent),
            // SYSTEM FIELDS - FORCED
            createdBy: (session.user as { id?: string }).id,
            postedDate: new Date(),
            viewCount: 0,
            applicationCount: 0,
            status: 'published' // Default to published
        };

        const job = await Job.create(jobData);

        return NextResponse.json({
            success: true,
            data: job,
        }, { status: 201 });
    } catch (error) {
        // STRUCTURED ERROR LOGGING
        console.error('[Create Job Error]:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create job' },
            { status: 500 }
        );
    }
}
