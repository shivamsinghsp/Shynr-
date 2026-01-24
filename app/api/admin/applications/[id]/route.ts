import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/db';
import Application from '@/db/models/Application';
import { sendApplicationStatusEmail, isEmailConfigured } from '@/lib/mail';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/admin/applications/[id] - Get single application details
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
        const application = await Application.findById(id)
            .populate('job')
            .populate('user', 'firstName lastName email phone profileImage education experience skills resume')
            .lean();

        if (!application) {
            return NextResponse.json(
                { success: false, error: 'Application not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: application,
        });
    } catch (error) {
        console.error('Error fetching application:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch application' },
            { status: 500 }
        );
    }
}

// PUT /api/admin/applications/[id] - Update application status
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
        const { status, internalNotes, rating } = body;

        // Get admin user ID
        const Admin = (await import('@/db/models/Admin')).default;
        const admin = await Admin.findOne({ email: session.user.email });

        const updateData: any = { updatedAt: new Date() };

        if (status) {
            updateData.status = status;
            updateData.$push = {
                statusHistory: {
                    status,
                    changedAt: new Date(),
                    changedBy: admin?._id,
                    note: body.statusNote || `Status changed to ${status}`
                }
            };
        }

        if (internalNotes !== undefined) {
            updateData.internalNotes = internalNotes;
        }

        if (rating !== undefined) {
            updateData.rating = rating;
        }

        const application = await Application.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('job', 'title company').populate('user', 'firstName lastName email');

        if (!application) {
            return NextResponse.json(
                { success: false, error: 'Application not found' },
                { status: 404 }
            );
        }

        // Send email notification to applicant if status changed
        if (status && application.user && (application.user as any).email) {
            const user = application.user as any;
            const job = application.job as any;
            const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Applicant';
            const jobTitle = job?.title || 'Position';
            const company = job?.company || 'Company';

            try {
                if (isEmailConfigured()) {
                    await sendApplicationStatusEmail(
                        user.email,
                        userName,
                        jobTitle,
                        company,
                        status,
                        body.statusNote
                    );
                    console.log(`✅ Status change email sent to ${user.email}`);
                }
            } catch (emailError) {
                console.error('Failed to send status email:', emailError);
                // Don't fail the request if email fails
            }
        }

        return NextResponse.json({
            success: true,
            data: application,
            emailSent: isEmailConfigured(),
        });
    } catch (error) {
        console.error('Error updating application:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update application' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/applications/[id] - Delete an application
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

        const application = await Application.findByIdAndDelete(id);

        if (!application) {
            return NextResponse.json(
                { success: false, error: 'Application not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Application deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting application:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete application' },
            { status: 500 }
        );
    }
}
