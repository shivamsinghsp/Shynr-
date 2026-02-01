import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/db';
import User from '@/db/models/User';
import bcrypt from 'bcryptjs';

/**
 * Admin seeding route - DEVELOPMENT ONLY
 * 
 * This route is blocked in production.
 * Admin credentials must be provided via environment variables:
 * - ADMIN_EMAIL
 * - ADMIN_PASSWORD
 * - ADMIN_FIRST_NAME
 * - ADMIN_LAST_NAME
 */

export async function POST(request: NextRequest) {
    // BLOCK IN PRODUCTION - NO EXCEPTIONS
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
            { error: 'This endpoint is disabled in production' },
            { status: 403 }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        if (!secret || secret !== process.env.NEXTAUTH_SECRET) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get admin credentials from environment variables - NOT hardcoded
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminFirstName = process.env.ADMIN_FIRST_NAME || 'Admin';
        const adminLastName = process.env.ADMIN_LAST_NAME || 'User';

        if (!adminEmail || !adminPassword) {
            return NextResponse.json({
                error: 'ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables',
                hint: 'Add ADMIN_EMAIL and ADMIN_PASSWORD to your .env file'
            }, { status: 400 });
        }

        // Validate password strength
        if (adminPassword.length < 12) {
            return NextResponse.json({
                error: 'Admin password must be at least 12 characters'
            }, { status: 400 });
        }

        await dbConnect();

        const normalizedEmail = adminEmail.toLowerCase();
        const existingAdmin = await User.findOne({ email: normalizedEmail });

        if (existingAdmin) {
            const hashedPassword = await bcrypt.hash(adminPassword, 12);
            existingAdmin.password = hashedPassword;
            existingAdmin.role = 'admin';
            existingAdmin.onboardingCompleted = true;
            existingAdmin.onboardingStep = 'complete';
            existingAdmin.emailVerified = true;
            await existingAdmin.save();

            return NextResponse.json({
                success: true,
                message: 'Admin user updated',
                email: normalizedEmail,
            });
        } else {
            const hashedPassword = await bcrypt.hash(adminPassword, 12);

            await User.create({
                email: normalizedEmail,
                password: hashedPassword,
                firstName: adminFirstName,
                lastName: adminLastName,
                role: 'admin',
                provider: 'credentials',
                onboardingCompleted: true,
                onboardingStep: 'complete',
                emailVerified: true
            });

            return NextResponse.json({
                success: true,
                message: 'Admin user created',
                email: normalizedEmail,
            });
        }
    } catch (error) {
        console.error('Error seeding admin:', error);
        return NextResponse.json(
            { error: 'Failed to seed admin' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    // BLOCK IN PRODUCTION
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
            { error: 'This endpoint is disabled in production' },
            { status: 403 }
        );
    }

    return NextResponse.json({
        message: 'Use POST request with ?secret=YOUR_NEXTAUTH_SECRET',
        required_env_vars: ['ADMIN_EMAIL', 'ADMIN_PASSWORD'],
        optional_env_vars: ['ADMIN_FIRST_NAME', 'ADMIN_LAST_NAME']
    });
}
