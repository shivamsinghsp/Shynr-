import mongoose, { Schema, Document, Model } from 'mongoose';

// Resume snapshot interface
interface IResumeSnapshot {
    url: string;
    filename: string;
}

// Custom question answer interface
interface IAnswer {
    question: string;
    answer: string;
}

// Status history interface
interface IStatusHistory {
    status: string;
    changedAt: Date;
    changedBy?: mongoose.Types.ObjectId;
    note?: string;
}

// Main Application interface
export interface IApplication extends Document {
    job: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;

    coverLetter?: string;
    resume: IResumeSnapshot;

    answers?: IAnswer[];

    status: 'pending' | 'reviewed' | 'shortlisted' | 'interview' | 'offered' | 'rejected' | 'withdrawn';
    statusHistory: IStatusHistory[];

    internalNotes?: string;
    rating?: number;

    appliedAt: Date;
    updatedAt: Date;
}

const ResumeSnapshotSchema = new Schema<IResumeSnapshot>({
    url: { type: String, required: true },
    filename: { type: String, required: true },
});

const AnswerSchema = new Schema<IAnswer>({
    question: { type: String, required: true },
    answer: { type: String, required: true },
});

const StatusHistorySchema = new Schema<IStatusHistory>({
    status: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    note: { type: String },
});

const ApplicationSchema = new Schema<IApplication>(
    {
        job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },

        coverLetter: { type: String },
        resume: { type: ResumeSnapshotSchema, required: true },

        answers: [AnswerSchema],

        status: {
            type: String,
            enum: ['pending', 'reviewed', 'shortlisted', 'interview', 'offered', 'rejected', 'withdrawn'],
            default: 'pending',
        },
        statusHistory: [StatusHistorySchema],

        internalNotes: { type: String },
        rating: { type: Number, min: 1, max: 5 },

        appliedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
    }
);

// Indexes
ApplicationSchema.index({ job: 1, user: 1 }, { unique: true }); // Prevent duplicate applications
ApplicationSchema.index({ user: 1, appliedAt: -1 });
ApplicationSchema.index({ job: 1, status: 1 });
ApplicationSchema.index({ status: 1 });

const Application: Model<IApplication> = mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);

export default Application;
