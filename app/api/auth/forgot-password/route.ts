import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/db';
import User from '@/db/models/User';
import PasswordResetToken from '@/db/models/PasswordResetToken';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });

        // Always return success to prevent email enumeration
        if (!user) {
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
            token,
            expiresAt,
        });

        const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

        // Send Email
        await sendPasswordResetEmail(email, resetUrl);

        return NextResponse.json({
            success: true,
            message: 'If an account exists with this email, you will receive a password reset link.',
        });
    } catch (error) {
        console.error('Error in forgot password:', error);
        return NextResponse.json(
            { error: 'Something went wrong' },
            { status: 500 }
        );
    }
}
