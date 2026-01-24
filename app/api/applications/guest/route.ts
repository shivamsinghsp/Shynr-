import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/db';
import mongoose from 'mongoose';

// Guest Application Schema (inline for simplicity)
const GuestApplicationSchema = new mongoose.Schema({
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    applicant: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String
        },
        linkedin: String,
        portfolio: String,
        skills: [String]
    },
    coverLetter: String,
    resume: {
        url: { type: String, required: true },
        filename: { type: String, required: true }
    },
    education: [{
        institution: String,
        degree: String,
        fieldOfStudy: String,
        startDate: Date,
        endDate: Date,
        current: Boolean
    }],
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'shortlisted', 'interview', 'offered', 'rejected'],
        default: 'pending'
    },
    appliedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// POST /api/applications/guest - Submit a guest job application (no login required)
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { jobId, applicant, coverLetter, resume, education } = body;

        // Validate required fields
        if (!jobId) {
            return NextResponse.json(
                { success: false, error: 'Job ID is required' },
                { status: 400 }
            );
        }

        if (!applicant?.firstName || !applicant?.lastName || !applicant?.email || !applicant?.phone) {
            return NextResponse.json(
                { success: false, error: 'Applicant details (name, email, phone) are required' },
                { status: 400 }
            );
        }

        if (!resume?.url || !resume?.filename) {
            return NextResponse.json(
                { success: false, error: 'Resume is required' },
                { status: 400 }
            );
        }

        // Check if job exists
        const Job = mongoose.models.Job;
        const job = await Job.findById(jobId);
        if (!job) {
            return NextResponse.json(
                { success: false, error: 'Job not found' },
                { status: 404 }
            );
        }

        // Get or create GuestApplication model
        const GuestApplication = mongoose.models.GuestApplication ||
            mongoose.model('GuestApplication', GuestApplicationSchema);

        // Check for duplicate applications by email for same job
        const existingApplication = await GuestApplication.findOne({
            job: jobId,
            'applicant.email': applicant.email.toLowerCase()
        });

        if (existingApplication) {
            return NextResponse.json(
                { success: false, error: 'You have already applied for this job' },
                { status: 400 }
            );
        }

        // Create guest application
        const application = await GuestApplication.create({
            job: jobId,
            applicant: {
                firstName: applicant.firstName,
                lastName: applicant.lastName,
                email: applicant.email.toLowerCase(),
                phone: applicant.phone,
                address: applicant.address || {},
                linkedin: applicant.linkedin || '',
                portfolio: applicant.portfolio || '',
                skills: applicant.skills || []
            },
            coverLetter: coverLetter || '',
            resume,
            education: education || [],
            status: 'pending'
        });

        return NextResponse.json({
            success: true,
            data: { id: application._id },
            message: 'Application submitted successfully'
        });

    } catch (error) {
        console.error('Error submitting guest application:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to submit application' },
            { status: 500 }
        );
    }
}
