import mongoose, { Schema, Document, Model } from 'mongoose';

// Salary subdocument interface
interface ISalary {
    min: number;
    max: number;
    currency: string;
    period: 'hourly' | 'monthly' | 'yearly';
}

// Main Job interface
export interface IJob extends Document {
    title: string;
    company: string;
    companyLogo?: string;

    location: string;
    locationType: 'onsite' | 'remote' | 'hybrid';

    category: string;
    type: 'Full Time' | 'Part Time' | 'Contract' | 'Internship' | 'Remote';
    experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Executive';

    salary: ISalary;
    salaryDisplay?: string;

    description: string;
    shortDescription?: string;
    responsibilities?: string[];
    requirements?: string[];
    benefits?: string[];
    skills?: string[];

    requiredExperience?: string;
    requiredDegree?: string;

    applicationDeadline?: Date;
    externalApplyUrl?: string;

    status: 'draft' | 'published' | 'closed' | 'archived';
    featured: boolean;
    urgent: boolean;

    viewCount: number;
    applicationCount: number;

    createdBy: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;

    postedDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

const SalarySchema = new Schema<ISalary>({
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    period: { type: String, enum: ['hourly', 'monthly', 'yearly'], default: 'yearly' },
});

const JobSchema = new Schema<IJob>(
    {
        title: { type: String, required: [true, 'Job title is required'], trim: true },
        company: { type: String, required: [true, 'Company name is required'], trim: true },
        companyLogo: { type: String },

        location: { type: String, required: [true, 'Location is required'] },
        locationType: {
            type: String,
            enum: ['onsite', 'remote', 'hybrid'],
            default: 'onsite',
        },

        category: { type: String, required: [true, 'Category is required'] },
        type: {
            type: String,
            enum: ['Full Time', 'Part Time', 'Contract', 'Internship', 'Remote'],
            default: 'Full Time',
        },
        experienceLevel: {
            type: String,
            enum: ['Entry', 'Mid', 'Senior', 'Lead', 'Executive'],
            default: 'Mid',
        },

        salary: { type: SalarySchema, required: true },
        salaryDisplay: { type: String },

        description: { type: String, required: [true, 'Description is required'] },
        shortDescription: { type: String },
        responsibilities: [{ type: String }],
        requirements: [{ type: String }],
        benefits: [{ type: String }],
        skills: [{ type: String }],

        requiredExperience: { type: String },
        requiredDegree: { type: String },

        applicationDeadline: { type: Date },
        externalApplyUrl: { type: String },

        status: {
            type: String,
            enum: ['draft', 'published', 'closed', 'archived'],
            default: 'draft',
        },
        featured: { type: Boolean, default: false },
        urgent: { type: Boolean, default: false },

        viewCount: { type: Number, default: 0 },
        applicationCount: { type: Number, default: 0 },

        createdBy: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },

        postedDate: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient querying
JobSchema.index({ status: 1, postedDate: -1 });
JobSchema.index({ category: 1 });
JobSchema.index({ location: 1 });
JobSchema.index({ type: 1 });
JobSchema.index({ title: 'text', company: 'text', description: 'text' });

const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);

export default Job;
