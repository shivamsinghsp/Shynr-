import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/db';
import User from '@/db/models/User';
import Admin from '@/db/models/Admin';
import OTP from '@/db/models/OTP';
import { generateOTP, sendPasswordResetOTP, sendEmailVerificationOTP, sendAdminLoginOTP, isEmailConfigured } from '@/lib/mail';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 3; // 3 OTP requests per minute per email

function isRateLimited(email: string): boolean {
    const now = Date.now();
    const key = email.toLowerCase();
    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
        rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return false;
    }

    if (record.count >= MAX_REQUESTS) {
        return true;
    }

    record.count++;
    return false;
}

export async function POST(request: NextRequest) {
    try {
        const { email, type } = await request.json();

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

        if (!type || !['password_reset', 'email_verification', 'admin_login'].includes(type)) {
            return NextResponse.json(
                { error: 'Valid OTP type is required' },
                { status: 400 }
            );
        }

        // Rate limiting check
        if (isRateLimited(email)) {
            return NextResponse.json(
                { error: 'Too many requests. Please wait a minute before trying again.' },
                { status: 429 }
            );
        }

        await dbConnect();

        const normalizedEmail = email.toLowerCase();

        // For password reset and admin login, verify the email exists
        // But ALWAYS return same response to prevent enumeration
        let userExists = false;
        let userName: string | undefined;

        if (type === 'password_reset') {
            // Check both User and Admin collections
            let user = await User.findOne({ email: normalizedEmail });
            if (!user) {
                user = await Admin.findOne({ email: normalizedEmail });
            }
            userExists = !!user;
            userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : undefined;
        } else if (type === 'admin_login') {
            const admin = await Admin.findOne({ email: normalizedEmail });
            userExists = !!admin;
            userName = admin ? `${admin.firstName || ''} ${admin.lastName || ''}`.trim() : undefined;
        } else {
            // email_verification - user may not exist yet
            const user = await User.findOne({ email: normalizedEmail });
            userExists = true; // Allow sending for new signups
            userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : undefined;
        }

        // Always return success message (prevent enumeration)
        // But only actually send OTP if user exists
        if (!userExists) {
            // Log attempt but return success to prevent enumeration
            console.log(`OTP requested for non-existent email: ${normalizedEmail}`);
            return NextResponse.json({
                success: true,
                message: 'If an account exists, you will receive an OTP.',
            });
        }

        // Generate 6-digit OTP
        const otp = generateOTP();

        // Store OTP in database (createOTP should handle expiry)
        await OTP.createOTP(normalizedEmail, otp, type);

        // Send OTP email based on type
        let emailResult;
        switch (type) {
            case 'password_reset':
                emailResult = await sendPasswordResetOTP(normalizedEmail, otp, userName);
                break;
            case 'email_verification':
                emailResult = await sendEmailVerificationOTP(normalizedEmail, otp, userName);
                break;
            case 'admin_login':
                emailResult = await sendAdminLoginOTP(normalizedEmail, otp, userName);
                break;
            default:
                emailResult = await sendPasswordResetOTP(normalizedEmail, otp, userName);
        }

        // NEVER expose OTP in response - even in dev mode
        if (!emailResult.success) {
            console.error('Failed to send OTP email:', emailResult.error);

            // In development only, log OTP to console (NOT in response)
            if (process.env.NODE_ENV === 'development') {
                console.log(`🔐 [DEV ONLY - CONSOLE] OTP for ${normalizedEmail}: ${otp}`);
            }

            return NextResponse.json(
                { error: 'Failed to send OTP. Please try again.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'If an account exists, you will receive an OTP.',
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        return NextResponse.json(
            { error: 'Something went wrong. Please try again.' },
            { status: 500 }
        );
    }
}
