import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/db';
import Announcement from '@/db/models/Announcement';
import mongoose from 'mongoose';

// PUT - Update an announcement
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid announcement ID' }, { status: 400 });
        }

        await connectDB();

        const body = await request.json();
        const { title, content, priority, category, targetRoles, expiresAt, isActive } = body;

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (priority !== undefined) updateData.priority = priority;
        if (category !== undefined) updateData.category = category;
        if (targetRoles !== undefined) updateData.targetRoles = targetRoles;
        if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
        if (isActive !== undefined) updateData.isActive = isActive;

        const announcement = await Announcement.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!announcement) {
            return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Announcement updated successfully',
            announcement,
        });
    } catch (error: any) {
        console.error('Error updating announcement:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update announcement' },
            { status: 500 }
        );
    }
}

// DELETE - Delete an announcement
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid announcement ID' }, { status: 400 });
        }

        await connectDB();

        const deleted = await Announcement.findByIdAndDelete(id);
        if (!deleted) {
            return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Announcement deleted successfully',
        });
    } catch (error: any) {
        console.error('Error deleting announcement:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete announcement' },
            { status: 500 }
        );
    }
}
