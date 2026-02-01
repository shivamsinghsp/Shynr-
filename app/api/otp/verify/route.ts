import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/db';
import OTP from '@/db/models/OTP';
import { otpVerifyRateLimiter } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
    try {
        const { email, otp, type } = await request.json();

        if (!email || typeof email !== 'string') {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        if (!otp || typeof otp !== 'string') {
            return NextResponse.json(
                { error: 'OTP is required' },
                { status: 400 }
            );
        }

        if (!type || !['password_reset', 'email_verification', 'admin_login'].includes(type)) {
            return NextResponse.json(
                { error: 'Valid OTP type is required' },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase();

        // Rate limit check
        const rateCheck = otpVerifyRateLimiter.check(normalizedEmail);
        if (rateCheck.limited) {
            const retryMinutes = Math.ceil(rateCheck.retryAfterMs / 60000);
            return NextResponse.json(
                { error: `Too many attempts. Try again in ${retryMinutes} minute(s).` },
                { status: 429 }
            );
        }

        await dbConnect();

        // Verify OTP
        const result = await OTP.verifyOTP(normalizedEmail, otp, type);

        if (!result.valid) {
            // Return generic message to prevent enumeration
            return NextResponse.json(
                { error: 'Invalid or expired OTP' },
                { status: 400 }
            );
        }

        // Reset rate limit on successful verification
        otpVerifyRateLimiter.reset(normalizedEmail);

        // For password_reset, the OTP is marked as verified in the DB
        // The reset-password endpoint will check for this verified OTP
        return NextResponse.json({
            success: true,
            message: 'OTP verified successfully',
            // DO NOT return any tokens - the verified OTP in DB is the proof
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return NextResponse.json(
            { error: 'Something went wrong. Please try again.' },
            { status: 500 }
        );
    }
}
