import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/db';
import Application from '@/db/models/Application';
import mongoose from 'mongoose';

// GET /api/applications - Get user's applications
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const User = mongoose.models.User;
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        const applications = await Application.find({ user: user._id })
            .populate('job')
            .sort({ appliedAt: -1 });

        return NextResponse.json({
            success: true,
            data: applications
        });

    } catch (error) {
        console.error('Error fetching applications:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch applications' },
            { status: 500 }
        );
    }
}

// POST /api/applications - Submit a job application
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

        const User = mongoose.models.User;
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        const body = await request.json();
        const { jobId, coverLetter, resume, answers, education } = body; // Added education

        if (!jobId || !resume || !resume.url || !resume.filename) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if already applied
        const existingApplication = await Application.findOne({
            job: jobId,
            user: user._id
        });

        if (existingApplication) {
            return NextResponse.json(
                { success: false, error: 'You have already applied for this job' },
                { status: 400 }
            );
        }

        // Create application
        const application = await Application.create({
            job: jobId,
            user: user._id,
            coverLetter,
            resume,
            answers,
            // education: education, // Store education if needed in application object, or just rely on user profile update
            status: 'pending',
            statusHistory: [{
                status: 'pending',
                note: 'Application submitted',
                changedAt: new Date()
            }]
        });

        return NextResponse.json({
            success: true,
            data: application,
            message: 'Application submitted successfully'
        });

    } catch (error) {
        console.error('Error submitting application:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to submit application' },
            { status: 500 }
        );
    }
}
