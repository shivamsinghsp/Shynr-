import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/db';
import User from '@/db/models/User';
import bcrypt from 'bcryptjs';

// Diagnostic endpoint - no auth required
export async function GET(request: NextRequest) {
    const results: any = {
        timestamp: new Date().toISOString(),
        steps: []
    };

    try {
        // Step 1: Check environment
        results.steps.push({ step: 'env_check', nextauth_secret_set: !!process.env.NEXTAUTH_SECRET });

        // Step 2: Connect to database
        results.steps.push({ step: 'db_connecting' });
        await dbConnect();
        results.steps.push({ step: 'db_connected', success: true });

        // Step 3: Check admin user
        const adminEmail = 'shivam.sp2106@gmail.com';
        const adminPassword = 'Shivam@2105';

        const existingUser = await User.findOne({ email: adminEmail });

        if (existingUser) {
            results.steps.push({
                step: 'user_found',
                email: existingUser.email,
                role: existingUser.role,
                hasPassword: !!existingUser.password,
                provider: existingUser.provider
            });

            // Update the user
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            existingUser.password = hashedPassword;
            existingUser.role = 'admin';
            existingUser.onboardingCompleted = true;
            existingUser.onboardingStep = 'complete';
            existingUser.emailVerified = true;
            await existingUser.save();

            results.steps.push({ step: 'user_updated', success: true });
            results.success = true;
            results.message = 'Admin user updated successfully. Try logging in now.';
        } else {
            results.steps.push({ step: 'user_not_found', creating: true });

            // Create the user
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await User.create({
                email: adminEmail,
                password: hashedPassword,
                firstName: 'Shivam',
                lastName: 'SP',
                role: 'admin',
                provider: 'credentials',
                onboardingCompleted: true,
                onboardingStep: 'complete',
                emailVerified: true
            });

            results.steps.push({ step: 'user_created', success: true });
            results.success = true;
            results.message = 'Admin user created successfully. Try logging in now.';
        }

        results.credentials = {
            email: adminEmail,
            password: adminPassword,
            loginUrl: '/admin'
        };

        return NextResponse.json(results);
    } catch (error: any) {
        results.error = {
            message: error.message,
            name: error.name,
            code: error.code,
            stack: error.stack?.split('\n').slice(0, 5)
        };
        return NextResponse.json(results, { status: 500 });
    }
}
