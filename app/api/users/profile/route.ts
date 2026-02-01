import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/db';
import User from '@/db/models/User';

// Fields that can be updated via profile API
const ALLOWED_UPDATE_FIELDS = [
    'firstName', 'lastName', 'phone', 'location', 'headline',
    'summary', 'resume', 'profileImage', 'education', 'experience',
    'skills', 'address', 'bio', 'socialLinks', 'dateOfBirth',
    'preferredJobType', 'preferredLocations', 'expectedSalary',
];

/**
 * Calculate profile completeness based on filled fields
 */
function calculateCompleteness(user: Record<string, unknown>): number {
    let completeness = 0;

    if (user.firstName) completeness += 10;
    if (user.lastName) completeness += 10;
    if (user.phone) completeness += 10;
    if (user.location || (user.address as Record<string, unknown>)?.city) completeness += 10;
    if (user.headline) completeness += 10;
    if (user.summary) completeness += 10;
    if ((user.resume as Record<string, unknown>)?.url) completeness += 15;
    if (user.profileImage) completeness += 10;
    if (Array.isArray(user.education) && user.education.length > 0) completeness += 7;
    if (Array.isArray(user.experience) && user.experience.length > 0) completeness += 8;

    return Math.min(completeness, 100);
}

// GET /api/users/profile - Get current user profile
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        await dbConnect();

        const user = await User.findOne({ email: session.user.email })
            .select('-password')
            .lean();

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Profile not found' },
                { status: 404 }
            );
        }

        // Calculate profile completeness dynamically
        const completeness = calculateCompleteness(user as unknown as Record<string, unknown>);

        return NextResponse.json({
            success: true,
            data: {
                ...user,
                profileCompleteness: completeness,
            },
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
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        await dbConnect();

        const body = await request.json();

        // Whitelist approach: only allow specific fields to be updated
        const updateData: Record<string, unknown> = {};
        for (const field of ALLOWED_UPDATE_FIELDS) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }

        // Validate string fields don't exceed reasonable limits
        if (typeof updateData.firstName === 'string' && updateData.firstName.length > 50) {
            return NextResponse.json(
                { success: false, error: 'First name too long' },
                { status: 400 }
            );
        }
        if (typeof updateData.lastName === 'string' && updateData.lastName.length > 50) {
            return NextResponse.json(
                { success: false, error: 'Last name too long' },
                { status: 400 }
            );
        }
        if (typeof updateData.headline === 'string' && updateData.headline.length > 200) {
            return NextResponse.json(
                { success: false, error: 'Headline too long' },
                { status: 400 }
            );
        }
        if (typeof updateData.summary === 'string' && updateData.summary.length > 2000) {
            return NextResponse.json(
                { success: false, error: 'Summary too long' },
                { status: 400 }
            );
        }

        // Get current user to merge with updates for completeness calculation
        const currentUser = await User.findOne({ email: session.user.email }).lean();
        if (!currentUser) {
            return NextResponse.json(
                { success: false, error: 'Profile not found' },
                { status: 404 }
            );
        }

        // Merge current user data with updates
        const mergedData = { ...currentUser, ...updateData } as Record<string, unknown>;
        const completeness = calculateCompleteness(mergedData);

        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            {
                ...updateData,
                profileCompleteness: completeness,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Failed to update profile' },
                { status: 500 }
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
