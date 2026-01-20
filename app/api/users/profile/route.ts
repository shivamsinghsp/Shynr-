import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/db';
import User from '@/db/models/User';

// GET /api/users/profile - Get current user profile
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const user = await User.findOne({ email: session.user.email })
            .select('-password')
            .lean();

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch profile' },
            { status: 500 }
        );
    }
}

// PUT /api/users/profile - Update user profile
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const body = await request.json();

        // Remove sensitive fields that shouldn't be updated directly
        const { password, email, provider, providerId, ...updateData } = body;

        // Calculate profile completeness
        let completeness = 0;
        if (updateData.firstName) completeness += 10;
        if (updateData.lastName) completeness += 10;
        if (updateData.phone) completeness += 10;
        if (updateData.location) completeness += 10;
        if (updateData.headline) completeness += 10;
        if (updateData.summary) completeness += 10;
        if (updateData.resume?.url) completeness += 15;
        if (updateData.profileImage) completeness += 10;
        if (updateData.education?.length > 0) completeness += 7;
        if (updateData.experience?.length > 0) completeness += 8;

        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            {
                ...updateData,
                profileCompleteness: Math.min(completeness, 100),
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}
