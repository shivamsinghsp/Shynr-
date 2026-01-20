import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/db';
import User from '@/db/models/User';

// GET /api/users/onboarding - Get onboarding progress
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
            .select('onboardingCompleted onboardingStep firstName lastName phone location education experience resume profileImage')
            .lean();

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                onboardingCompleted: user.onboardingCompleted,
                onboardingStep: user.onboardingStep,
                profile: user,
            },
        });
    } catch (error) {
        console.error('Error fetching onboarding status:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch onboarding status' },
            { status: 500 }
        );
    }
}

// POST /api/users/onboarding - Save onboarding step data
export async function POST(request: NextRequest) {
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
        const { step, data, skip } = body;

        if (!step || (step < 1 || step > 3)) {
            return NextResponse.json(
                { success: false, error: 'Invalid step' },
                { status: 400 }
            );
        }

        // Determine next step
        let nextStep: number | 'complete' = step + 1;
        let onboardingCompleted = false;

        if (step === 3 || (skip && step === 3)) {
            nextStep = 'complete';
            onboardingCompleted = true;
        }

        // Build update object based on step
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {
            onboardingStep: nextStep,
            onboardingCompleted,
            updatedAt: new Date(),
        };

        if (!skip && data) {
            // Step 1: Basic Info
            if (step === 1) {
                if (data.firstName) updateData.firstName = data.firstName;
                if (data.lastName) updateData.lastName = data.lastName;
                if (data.phone) updateData.phone = data.phone;
                if (data.location) updateData.location = data.location;
                if (data.address) updateData.address = data.address;
            }

            // Step 2: Education & Experience
            if (step === 2) {
                if (data.education) updateData.education = data.education;
                if (data.experience) updateData.experience = data.experience;
                if (data.skills) updateData.skills = data.skills;
                if (data.headline) updateData.headline = data.headline;
                if (data.summary) updateData.summary = data.summary;
            }

            // Step 3: Resume & Profile Image
            if (step === 3) {
                if (data.resume) updateData.resume = data.resume;
                if (data.profileImage) updateData.profileImage = data.profileImage;
            }
        }

        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            updateData,
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
            data: {
                onboardingStep: user.onboardingStep,
                onboardingCompleted: user.onboardingCompleted,
            },
        });
    } catch (error) {
        console.error('Error saving onboarding data:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to save onboarding data' },
            { status: 500 }
        );
    }
}
