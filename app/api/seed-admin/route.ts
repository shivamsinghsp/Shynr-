import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/db';
import User from '@/db/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        // Simple auth check
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        if (secret !== process.env.NEXTAUTH_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const results = [];

        // Remove shivamsinghabc439@gmail.com from admin role (demote to regular user)
        const oldAdmin = await User.findOne({ email: 'shivamsinghabc439@gmail.com' });
        if (oldAdmin) {
            oldAdmin.role = 'user';
            await oldAdmin.save();
            results.push({ email: 'shivamsinghabc439@gmail.com', action: 'demoted to user' });
        }

        // Set up shivam.sp2106@gmail.com as the only admin
        const adminEmail = 'shivam.sp2106@gmail.com';
        const adminPassword = 'Shivam@2105';

        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            // Update password and role if user exists
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            existingAdmin.password = hashedPassword;
            existingAdmin.role = 'admin';
            existingAdmin.onboardingCompleted = true;
            existingAdmin.onboardingStep = 'complete';
            existingAdmin.emailVerified = true;
            await existingAdmin.save();

            results.push({ email: adminEmail, action: 'updated to admin' });
        } else {
            // Create new admin user
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

            results.push({ email: adminEmail, action: 'created as admin' });
        }

        return NextResponse.json({
            success: true,
            message: 'Admin configuration updated successfully',
            results
        });
    } catch (error) {
        console.error('Error seeding admin:', error);
        return NextResponse.json(
            { error: 'Failed to seed admin', details: String(error) },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    // Allow GET for easier testing - same logic as POST
    if (secret !== process.env.NEXTAUTH_SECRET) {
        return NextResponse.json({
            error: 'Unauthorized - add ?secret=YOUR_NEXTAUTH_SECRET to the URL',
            hint: 'Check your .env file for NEXTAUTH_SECRET value'
        }, { status: 401 });
    }

    try {
        await dbConnect();

        const adminEmail = 'shivam.sp2106@gmail.com';
        const adminPassword = 'Shivam@2105';

        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            existingAdmin.password = hashedPassword;
            existingAdmin.role = 'admin';
            existingAdmin.onboardingCompleted = true;
            existingAdmin.onboardingStep = 'complete';
            existingAdmin.emailVerified = true;
            await existingAdmin.save();

            return NextResponse.json({
                success: true,
                message: 'Admin user updated successfully',
                email: adminEmail,
                action: 'updated'
            });
        } else {
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

            return NextResponse.json({
                success: true,
                message: 'Admin user created successfully',
                email: adminEmail,
                action: 'created'
            });
        }
    } catch (error) {
        console.error('Error seeding admin:', error);
        return NextResponse.json(
            { error: 'Failed to seed admin', details: String(error) },
            { status: 500 }
        );
    }
}
