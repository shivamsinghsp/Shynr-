import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/db';
import User from '@/db/models/User';
import Admin from '@/db/models/Admin';
import PasswordResetToken from '@/db/models/PasswordResetToken';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';
import { passwordResetRateLimiter } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email || typeof email !== 'string') {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase();

        // Rate limit check
        const rateCheck = passwordResetRateLimiter.check(normalizedEmail);
        if (rateCheck.limited) {
            const retryMinutes = Math.ceil(rateCheck.retryAfterMs / 60000);
            return NextResponse.json(
                { error: `Too many reset requests. Try again in ${retryMinutes} minute(s).` },
                { status: 429 }
            );
        }

        await dbConnect();

        // Find user in User collection first (includes regular users and employees)
        let user = await User.findOne({ email: normalizedEmail });
        let userType: 'user' | 'admin' = 'user';

        // If not found in User, check Admin collection
        if (!user) {
            user = await Admin.findOne({ email: normalizedEmail });
            userType = 'admin';
        }

        // Always return success to prevent email enumeration
        if (!user) {
            // Log the attempt but don't reveal user doesn't exist
            console.log(`Password reset requested for non-existent email: ${normalizedEmail}`);
            return NextResponse.json({
                success: true,
                message: 'If an account exists with this email, you will receive a password reset link.'
            });
        }

        // Generate secure token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        // Delete any existing tokens for this user
        await PasswordResetToken.deleteMany({ userId: user._id });

        // Create new reset token
        await PasswordResetToken.create({
            userId: user._id,
            userType,
            token,
            expiresAt,
        });

        const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

        // Send Email
        try {
            await sendPasswordResetEmail(normalizedEmail, resetUrl);
        } catch (emailError) {
            console.error('Failed to send password reset email:', emailError);
            // Delete the token if email fails
            await PasswordResetToken.deleteMany({ userId: user._id });
            return NextResponse.json(
                { error: 'Failed to send reset email. Please try again.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'If an account exists with this email, you will receive a password reset link.',
        });
    } catch (error) {
        console.error('Error in forgot password:', error);
        return NextResponse.json(
            { error: 'Something went wrong. Please try again.' },
            { status: 500 }
        );
    }
}
