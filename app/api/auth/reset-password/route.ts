import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/db';
import User from '@/db/models/User';
import PasswordResetToken from '@/db/models/PasswordResetToken';
import OTP from '@/db/models/OTP';
import bcrypt from 'bcryptjs';

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

        await dbConnect();

        let user;

        // Option 1: OTP-verified password reset
        if (otpVerified && email) {
            // Verify there was a recent verified OTP for this email
            const recentOTP = await OTP.findOne({
                email: email.toLowerCase(),
                type: 'password_reset',
                verified: true,
            });

            if (!recentOTP) {
                return NextResponse.json(
                    { error: 'Please verify your email first with OTP' },
                    { status: 400 }
                );
            }

            // Find the user by email
            user = await User.findOne({ email: email.toLowerCase() });

            if (!user) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            // Delete the verified OTP
            await OTP.deleteOne({ _id: recentOTP._id });
        }
        // Option 2: Token-based password reset (legacy support)
        else if (token) {
            // Find the reset token
            const resetToken = await PasswordResetToken.findOne({ token });

            if (!resetToken) {
                return NextResponse.json(
                    { error: 'Invalid or expired reset token' },
                    { status: 400 }
                );
            }

            // Check if token has expired
            if (resetToken.expiresAt < new Date()) {
                await PasswordResetToken.deleteOne({ _id: resetToken._id });
                return NextResponse.json(
                    { error: 'Reset token has expired. Please request a new one.' },
                    { status: 400 }
                );
            }

            // Find the user
            user = await User.findById(resetToken.userId);

            if (!user) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            // Delete the used token
            await PasswordResetToken.deleteOne({ _id: resetToken._id });
        } else {
            return NextResponse.json(
                { error: 'Either token or verified email is required' },
                { status: 400 }
            );
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user's password
        user.password = hashedPassword;
        await user.save();

        return NextResponse.json({
            success: true,
            message: 'Password has been reset successfully. You can now sign in with your new password.'
        });
    } catch (error) {
        console.error('Error in reset password:', error);
        return NextResponse.json(
            { error: 'Something went wrong' },
            { status: 500 }
        );
    }
}
