import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActivityLog extends Document {
    userId: mongoose.Types.ObjectId;
    userEmail: string;
    userRole: 'admin' | 'sub_admin';
    action: 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated' | 'promoted';
    entityType: 'job' | 'user' | 'employee' | 'attendance' | 'settings';
    entityId?: string;
    entityName?: string;
    description: string; // Human-readable description
    metadata?: Record<string, any>;
    createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        userEmail: {
            type: String,
            required: true,
        },
        userRole: {
            type: String,
            enum: ['admin', 'sub_admin'],
            required: true,
            index: true,
        },
        action: {
            type: String,
            enum: ['created', 'updated', 'deleted', 'activated', 'deactivated', 'promoted'],
            required: true,
            index: true,
        },
        entityType: {
            type: String,
            enum: ['job', 'user', 'employee', 'attendance', 'settings'],
            required: true,
            index: true,
        },
        entityId: {
            type: String,
        },
        entityName: {
            type: String,
        },
        description: {
            type: String,
            required: true,
        },
        metadata: {
            type: Schema.Types.Mixed,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    }
);

// Index for efficient queries
ActivityLogSchema.index({ createdAt: -1 }); // For chronological sorting
ActivityLogSchema.index({ userRole: 1, createdAt: -1 }); // For filtering by role

// TTL index for 90-day retention
ActivityLogSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 90 * 24 * 60 * 60 } // 90 days in seconds
);

const ActivityLog: Model<IActivityLog> =
    mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);

export default ActivityLog;

/**
 * Helper function to create an activity log entry
 */
export const logActivity = async ({
    userId,
    userEmail,
    userRole,
    action,
    entityType,
    entityId,
    entityName,
    description,
    metadata,
}: Omit<IActivityLog, 'createdAt' | keyof Document>) => {
    try {
        await ActivityLog.create({
            userId,
            userEmail,
            userRole,
            action,
            entityType,
            entityId,
            entityName,
            description,
            metadata,
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
        // Don't throw - logging failure shouldn't break the main operation
    }
};
