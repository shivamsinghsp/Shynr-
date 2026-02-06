import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/db';
import User from '@/db/models/User';
import PasswordResetToken from '@/db/models/PasswordResetToken';
import crypto from 'crypto';
import { sendWelcomeEmail, sendSubAdminPromotionEmail } from '@/lib/email';
import { canChangeRole, canDeactivateUser, canAccessAdminPanel } from '@/lib/permissions';
import { logActivity } from '@/db/models/ActivityLog';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/admin/users/[id] - Get single user details
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
        const user = await User.findById(id)
            .select('-password')
            .lean();

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch user' },
            { status: 500 }
        );
    }
}

// PUT /api/admin/users/[id] - Update user (activate/deactivate)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const userRole = (session?.user as any)?.role;

        // Allow both admin and sub_admin to access this endpoint
        if (!session?.user || !canAccessAdminPanel(userRole)) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const { id } = await params;
        const body = await request.json();
        const { isActive, role } = body;

        const updateData: any = { updatedAt: new Date() };

        // Check permission for deactivating users
        if (isActive !== undefined) {
            if (!canDeactivateUser(userRole)) {
                return NextResponse.json(
                    { success: false, error: 'You do not have permission to activate/deactivate users' },
                    { status: 403 }
                );
            }

            // Prevent deactivating the last super admin
            if (isActive === false) {
                const targetUser = await User.findById(id);
                if (targetUser?.role === 'admin') {
                    const superAdminCount = await User.countDocuments({ role: 'admin', isActive: true });
                    if (superAdminCount <= 1) {
                        return NextResponse.json(
                            { success: false, error: 'Cannot deactivate the last Super Admin' },
                            { status: 400 }
                        );
                    }
                }
            }

            updateData.isActive = isActive;

            // Fetch user for logging details
            const user = await User.findById(id);
            if (user) {
                // Log activity for activation/deactivation
                await logActivity({
                    userId: (session.user as any).id,
                    userEmail: session.user.email || '',
                    userRole: userRole as 'admin' | 'sub_admin',
                    action: isActive ? 'activated' : 'deactivated',
                    entityType: 'user',
                    entityId: id,
                    entityName: `${user.firstName} ${user.lastName}`,
                    description: `${isActive ? 'Activated' : 'Deactivated'} user: ${user.firstName} ${user.lastName}`,
                });
            }
        }

        // Allow role updates (user, employee, sub_admin) - admin promotion not allowed via this endpoint
        if (role !== undefined && ['user', 'employee', 'sub_admin'].includes(role)) {
            // Check permission for role changes
            if (!canChangeRole(userRole)) {
                return NextResponse.json(
                    { success: false, error: 'You do not have permission to change user roles' },
                    { status: 403 }
                );
            }

            // Prevent demoting the last super admin
            const targetUser = await User.findById(id);
            if (targetUser?.role === 'admin') {
                const superAdminCount = await User.countDocuments({ role: 'admin', isActive: true });
                if (superAdminCount <= 1) {
                    return NextResponse.json(
                        { success: false, error: 'Cannot demote the last Super Admin' },
                        { status: 400 }
                    );
                }
            }

            updateData.role = role;

            // Check if promoting to employee and user has no password (e.g. Google Auth)
            if (role === 'employee') {
                const currentUser = await User.findById(id);
                if (currentUser && !currentUser.password) {
                    // User promoted to employee but has no password.
                    // Generate reset token and send welcome email.
                    try {
                        const token = crypto.randomBytes(32).toString('hex');
                        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

                        // Clear existing tokens
                        await PasswordResetToken.deleteMany({ userId: currentUser._id });

                        await PasswordResetToken.create({
                            userId: currentUser._id,
                            userType: 'user', // Employees are in User collection
                            token,
                            expiresAt,
                        });

                        const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
                        await sendWelcomeEmail(currentUser.email, resetUrl);

                        console.log(`Sent welcome email to new employee: ${currentUser.email}`);
                    } catch (emailError) {
                        console.error('Failed to send welcome email:', emailError);
                        // Continue with update even if email fails, but log error
                    }
                }
            }

            // Check if promoting to sub_admin and user has no password
            if (role === 'sub_admin') {
                const currentUser = await User.findById(id);
                if (currentUser && !currentUser.password) {
                    // User promoted to sub_admin but has no password.
                    // Generate reset token and send sub admin promotion email.
                    try {
                        const token = crypto.randomBytes(32).toString('hex');
                        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

                        // Clear existing tokens
                        await PasswordResetToken.deleteMany({ userId: currentUser._id });

                        await PasswordResetToken.create({
                            userId: currentUser._id,
                            userType: 'user', // Sub admins are in User collection
                            token,
                            expiresAt,
                        });

                        const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
                        await sendSubAdminPromotionEmail(currentUser.email, resetUrl);

                        console.log(`Sent sub admin promotion email to: ${currentUser.email}`);
                    } catch (emailError) {
                        console.error('Failed to send sub admin promotion email:', emailError);
                        // Continue with update even if email fails, but log error
                    }
                }
            }
        }

        const user = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).select('-password');

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update user' },
            { status: 500 }
        );
    }
}
