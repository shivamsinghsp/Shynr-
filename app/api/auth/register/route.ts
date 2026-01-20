import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/db';
import User from '@/db/models/User';

// POST /api/auth/register - Register new user with email/password
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { email, password, firstName, lastName } = body;

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Validate password strength
        if (password.length < 8) {
            return NextResponse.json(
                { success: false, error: 'Password must be at least 8 characters' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'An account with this email already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await User.create({
            email: email.toLowerCase(),
            password: hashedPassword,
            provider: 'credentials',
            firstName: firstName || '',
            lastName: lastName || '',
            onboardingCompleted: false,
            onboardingStep: 1,
            isActive: true,
            emailVerified: false,
        });

        // Return success without password
        return NextResponse.json({
            success: true,
            message: 'Account created successfully',
            data: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Error registering user:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create account' },
            { status: 500 }
        );
    }
}
