import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/db';
import LeaveRequest from '@/db/models/LeaveRequest';
import mongoose from 'mongoose';
import { canAccessAdminPanel } from '@/lib/permissions';
import { logActivity } from '@/db/models/ActivityLog';

// PUT - Approve or reject a leave request
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
        if (!canAccessAdminPanel(userRole)) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid leave request ID' }, { status: 400 });
        }

        await connectDB();

        const body = await request.json();
        const { status, reviewNote } = body;

        if (!status || !['approved', 'rejected'].includes(status)) {
            return NextResponse.json(
                { error: 'Status must be either approved or rejected' },
                { status: 400 }
            );
        }

        const leaveRequest = await LeaveRequest.findById(id);
        if (!leaveRequest) {
            return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
        }

        if (leaveRequest.status !== 'pending') {
            return NextResponse.json(
                { error: 'Only pending leave requests can be reviewed' },
                { status: 400 }
            );
        }

        leaveRequest.status = status;
        leaveRequest.reviewedBy = session.user.id as any;
        leaveRequest.reviewedAt = new Date();
        if (reviewNote) {
            leaveRequest.reviewNote = reviewNote;
        }

        await leaveRequest.save();

        // Log the activity
        await logActivity({
            userId: (session.user as any).id,
            userEmail: session.user.email || '',
            userRole: userRole as 'admin' | 'sub_admin',
            action: 'updated',
            entityType: 'attendance', // Categorizing leave under attendance
            entityId: id,
            entityName: `Leave Request`,
            description: `${status === 'approved' ? 'Approved' : 'Rejected'} leave request`,
            metadata: {
                status: status,
                reviewNote: reviewNote
            },
        });

        return NextResponse.json({
            success: true,
            message: `Leave request ${status} successfully`,
            leaveRequest,
        });
    } catch (error: any) {
        console.error('Error updating leave request:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update leave request' },
            { status: 500 }
        );
    }
}

// DELETE - Delete a leave request (admin only)
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
        if (!canAccessAdminPanel(userRole)) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid leave request ID' }, { status: 400 });
        }

        await connectDB();

        const deleted = await LeaveRequest.findByIdAndDelete(id);
        if (!deleted) {
            return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Leave request deleted successfully',
        });
    } catch (error: any) {
        console.error('Error deleting leave request:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete leave request' },
            { status: 500 }
        );
    }
}
