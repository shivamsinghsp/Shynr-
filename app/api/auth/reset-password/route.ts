import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/db';
import User from '@/db/models/User';
import Admin from '@/db/models/Admin';
import PasswordResetToken from '@/db/models/PasswordResetToken';
import OTP from '@/db/models/OTP';
import bcrypt from 'bcryptjs';

// OTP validity window in milliseconds (15 minutes)
const OTP_VALIDITY_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token, password, email, otpVerified } = body;

        // Validate password
        if (!password) {
            return NextResponse.json(
                { error: 'Password is required' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters' },
                { status: 400 }
            );
        }

        // Password strength check
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
            return NextResponse.json(
                { error: 'Password must contain uppercase, lowercase, and numbers' },
                { status: 400 }
            );
        }

        await dbConnect();

        let user;
        let isAdmin = false;

        // Option 1: OTP-verified password reset
        if (otpVerified && email) {
            // Verify there was a recent verified OTP for this email WITH EXPIRY CHECK
            const recentOTP = await OTP.findOne({
                email: email.toLowerCase(),
                type: 'password_reset',
                verified: true,
                createdAt: { $gte: new Date(Date.now() - OTP_VALIDITY_MS) } // 15 min expiry
            });

            if (!recentOTP) {
                return NextResponse.json(
                    { error: 'OTP has expired or is invalid. Please request a new one.' },
                    { status: 400 }
                );
            }

            // Find the user by email - check both User and Admin
            user = await User.findOne({ email: email.toLowerCase() });

            if (!user) {
                // Check Admin collection
                user = await Admin.findOne({ email: email.toLowerCase() });
                isAdmin = !!user;
            }

            if (!user) {
                // Generic error to prevent enumeration
                return NextResponse.json(
                    { error: 'Password reset failed. Please try again.' },
                    { status: 400 }
                );
            }

            // Delete the verified OTP (single-use)
            await OTP.deleteMany({
                email: email.toLowerCase(),
                type: 'password_reset'
            });
        }
        // Option 2: Token-based password reset
        else if (token) {
            // Find the reset token
            const resetToken = await PasswordResetToken.findOne({ token });

            if (!resetToken) {
                return NextResponse.json(
                    { error: 'Invalid or expired reset link' },
                    { status: 400 }
                );
            }

            // Check if token has expired
            if (resetToken.expiresAt < new Date()) {
                await PasswordResetToken.deleteOne({ _id: resetToken._id });
                return NextResponse.json(
                    { error: 'Reset link has expired. Please request a new one.' },
                    { status: 400 }
                );
            }

            // Find the user based on userType
            if (resetToken.userType === 'admin') {
                user = await Admin.findById(resetToken.userId);
                isAdmin = true;
            } else {
                user = await User.findById(resetToken.userId);
            }

            if (!user) {
                return NextResponse.json(
                    { error: 'Password reset failed. Please try again.' },
                    { status: 400 }
                );
            }

            // Delete the used token (single-use)
            await PasswordResetToken.deleteMany({ userId: resetToken.userId });
        } else {
            return NextResponse.json(
                { error: 'Invalid request' },
                { status: 400 }
            );
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Update user's password
        user.password = hashedPassword;
        await user.save();

        return NextResponse.json({
            success: true,
            message: 'Password has been reset successfully.'
        });
    } catch (error) {
        console.error('Error in reset password:', error);
        return NextResponse.json(
            { error: 'Something went wrong. Please try again.' },
            { status: 500 }
        );
    }
}
