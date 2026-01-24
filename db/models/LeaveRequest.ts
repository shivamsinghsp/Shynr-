import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILeaveRequest extends Document {
    _id: mongoose.Types.ObjectId;
    employee: mongoose.Types.ObjectId;
    leaveType: 'annual' | 'sick' | 'personal' | 'unpaid' | 'other';
    startDate: Date;
    endDate: Date;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    reviewedBy?: mongoose.Types.ObjectId;
    reviewedAt?: Date;
    reviewNote?: string;
    totalDays: number;
    createdAt: Date;
    updatedAt: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>(
    {
        employee: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Employee is required'],
            index: true,
        },
        leaveType: {
            type: String,
            enum: ['annual', 'sick', 'personal', 'unpaid', 'other'],
            required: [true, 'Leave type is required'],
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required'],
        },
        endDate: {
            type: Date,
            required: [true, 'End date is required'],
        },
        reason: {
            type: String,
            required: [true, 'Reason is required'],
            maxlength: [500, 'Reason cannot exceed 500 characters'],
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
            index: true,
        },
        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        reviewedAt: {
            type: Date,
        },
        reviewNote: {
            type: String,
            maxlength: [300, 'Review note cannot exceed 300 characters'],
        },
        totalDays: {
            type: Number,
            default: 1,
        },
    },
    {
        timestamps: true,
    }
);

// Calculate total days before saving
LeaveRequestSchema.pre('save', function () {
    if (this.startDate && this.endDate) {
        const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
        this.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    }
});

// Ensure end date is not before start date
LeaveRequestSchema.pre('save', function () {
    if (this.endDate < this.startDate) {
        throw new Error('End date cannot be before start date');
    }
});

// Index for efficient querying
LeaveRequestSchema.index({ employee: 1, startDate: -1 });
LeaveRequestSchema.index({ status: 1, createdAt: -1 });

const LeaveRequest: Model<ILeaveRequest> =
    mongoose.models.LeaveRequest || mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);

export default LeaveRequest;
