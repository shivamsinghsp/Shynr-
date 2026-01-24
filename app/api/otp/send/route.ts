import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/db';
import User from '@/db/models/User';
import OTP from '@/db/models/OTP';
import { generateOTP, sendPasswordResetOTP, sendEmailVerificationOTP, sendAdminLoginOTP, isEmailConfigured } from '@/lib/mail';

export async function POST(request: NextRequest) {
    try {
        const { email, type } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        if (!type || !['password_reset', 'email_verification', 'admin_login'].includes(type)) {
            return NextResponse.json(
                { error: 'Valid OTP type is required (password_reset, email_verification, admin_login)' },
                { status: 400 }
            );
        }

        await dbConnect();

        // For password reset and admin login, verify the email exists
        if (type === 'password_reset' || type === 'admin_login') {
            const user = await User.findOne({ email: email.toLowerCase() });

            // Always return success to prevent email enumeration
            if (!user) {
                return NextResponse.json({
                    success: true,
                    message: 'If an account exists with this email, you will receive an OTP.',
                });
            }
        }

        // Generate 6-digit OTP
        const otp = generateOTP();

        // Store OTP in database
        await OTP.createOTP(email, otp, type);

        // Get user name for personalized email
        const user = await User.findOne({ email: email.toLowerCase() });
        const userName = user ? `${user.firstName} ${user.lastName}`.trim() : undefined;

        // Check if SMTP is configured
        const smtpConfigured = isEmailConfigured();

        // Send OTP email based on type
        let emailResult;
        switch (type) {
            case 'password_reset':
                emailResult = await sendPasswordResetOTP(email, otp, userName);
                break;
            case 'email_verification':
                emailResult = await sendEmailVerificationOTP(email, otp, userName);
                break;
            case 'admin_login':
                emailResult = await sendAdminLoginOTP(email, otp, userName);
                break;
            default:
                emailResult = await sendPasswordResetOTP(email, otp, userName);
        }

        // If email failed but we're in dev mode, return OTP in response
        if (!emailResult.success && emailResult.devMode) {
            console.log(`🔐 [DEV MODE] OTP for ${email}: ${otp}`);
            return NextResponse.json({
                success: true,
                message: 'OTP generated (Development Mode - SMTP not configured)',
                devMode: true,
                devOtp: otp, // Only shown in dev mode when SMTP is not configured
            });
        }

        if (!emailResult.success) {
            console.error('Failed to send OTP email:', emailResult.error);
            return NextResponse.json(
                { error: 'Failed to send OTP. Please try again.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'OTP has been sent to your email address.',
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        return NextResponse.json(
            { error: 'Something went wrong. Please try again.' },
            { status: 500 }
        );
    }
}
