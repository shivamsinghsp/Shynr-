import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/db';
import OTP from '@/db/models/OTP';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const { email, otp, type } = await request.json();

        if (!email || !otp) {
            return NextResponse.json(
                { error: 'Email and OTP are required' },
                { status: 400 }
            );
        }

        if (!type || !['password_reset', 'email_verification', 'admin_login'].includes(type)) {
            return NextResponse.json(
                { error: 'Valid OTP type is required' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Verify OTP
        const result = await OTP.verifyOTP(email, otp, type);

        if (!result.valid) {
            return NextResponse.json(
                { error: result.message },
                { status: 400 }
            );
        }

        // Generate a temporary token for password reset flow
        let resetToken = null;
        if (type === 'password_reset') {
            // Generate a secure token that can be used for the actual password reset
            resetToken = crypto.randomBytes(32).toString('hex');

            // Store this token temporarily (you could use the same OTP record or create a separate mechanism)
            // For simplicity, we'll pass it back to be used immediately in the reset password form
        }

        return NextResponse.json({
            success: true,
            message: result.message,
            ...(resetToken && { resetToken }),
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return NextResponse.json(
            { error: 'Something went wrong. Please try again.' },
            { status: 500 }
        );
    }
}
