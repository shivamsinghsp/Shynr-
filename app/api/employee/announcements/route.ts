import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/db';
import Announcement from '@/db/models/Announcement';

// GET - Get announcements for employees
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any).role || 'user';

        await connectDB();

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');
        const page = parseInt(searchParams.get('page') || '1');
        const category = searchParams.get('category');

        const now = new Date();
        const query: any = {
            isActive: true,
            targetRoles: userRole,
            $or: [
                { expiresAt: { $exists: false } },
                { expiresAt: null },
                { expiresAt: { $gt: now } },
            ],
        };

        if (category) {
            query.category = category;
        }

        const skip = (page - 1) * limit;

        const [announcements, total] = await Promise.all([
            Announcement.find(query)
                .populate('createdBy', 'firstName lastName')
                .sort({ priority: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Announcement.countDocuments(query),
        ]);

        // Count by priority for badges
        const urgentCount = await Announcement.countDocuments({
            ...query,
            priority: 'urgent',
        });

        const highCount = await Announcement.countDocuments({
            ...query,
            priority: 'high',
        });

        return NextResponse.json({
            success: true,
            announcements,
            summary: {
                urgent: urgentCount,
                high: highCount,
                total,
            },
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error: any) {
        console.error('Error fetching announcements:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch announcements' },
            { status: 500 }
        );
    }
}
