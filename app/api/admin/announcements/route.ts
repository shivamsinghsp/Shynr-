import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/db';
import Announcement from '@/db/models/Announcement';
import { canAccessAdminPanel } from '@/lib/permissions';
import { logActivity } from '@/db/models/ActivityLog';

// GET - Get all announcements (admin)
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (!canAccessAdminPanel(userRole)) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const page = parseInt(searchParams.get('page') || '1');
        const isActive = searchParams.get('isActive');

        const query: any = {};
        if (isActive !== null && isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        const skip = (page - 1) * limit;

        const [announcements, total] = await Promise.all([
            Announcement.find(query)
                .populate('createdBy', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Announcement.countDocuments(query),
        ]);

        return NextResponse.json({
            success: true,
            announcements,
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

// POST - Create a new announcement
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (!canAccessAdminPanel(userRole)) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        await connectDB();

        const body = await request.json();
        const { title, content, priority, category, targetRoles, expiresAt } = body;

        if (!title || !content) {
            return NextResponse.json(
                { error: 'Title and content are required' },
                { status: 400 }
            );
        }

        const announcement = new Announcement({
            title,
            content,
            priority: priority || 'normal',
            category: category || 'general',
            targetRoles: targetRoles || ['employee'],
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
            createdBy: session.user.id,
        });

        await announcement.save();

        // Log the activity
        await logActivity({
            userId: session.user.id as any,
            userEmail: session.user.email || '',
            userRole: userRole as 'admin' | 'sub_admin',
            action: 'created',
            entityType: 'settings', // Announcements under system settings
            entityId: announcement._id.toString(),
            entityName: announcement.title,
            description: `Created announcement: ${announcement.title}`,
            metadata: { priority: announcement.priority, targetRoles: announcement.targetRoles },
        });

        return NextResponse.json({
            success: true,
            message: 'Announcement created successfully',
            announcement,
        });
    } catch (error: any) {
        console.error('Error creating announcement:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create announcement' },
            { status: 500 }
        );
    }
}
