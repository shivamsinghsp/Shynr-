import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/db';
import User from '@/db/models/User';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const email = 'shivam.sp2106@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({
                exists: false,
                message: `User ${email} not found in database.`
            });
        }

        return NextResponse.json({
            exists: true,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            provider: user.provider,
            onboardingCompleted: user.onboardingCompleted,
            hasPassword: !!user.password,
            passwordHashLength: user.password ? user.password.length : 0,
            passwordHashStart: user.password ? user.password.substring(0, 10) : null
        });

    } catch (error: any) {
        return NextResponse.json({
            error: 'Database connection failed or query error',
            details: error.message
        }, { status: 500 });
    }
}
