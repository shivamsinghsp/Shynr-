import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnnouncement extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    content: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    category: 'general' | 'hr' | 'event' | 'policy' | 'achievement';
    isActive: boolean;
    expiresAt?: Date;
    createdBy: mongoose.Types.ObjectId;
    targetRoles: ('user' | 'employee' | 'admin')[];
    createdAt: Date;
    updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            maxlength: [150, 'Title cannot exceed 150 characters'],
            trim: true,
        },
        content: {
            type: String,
            required: [true, 'Content is required'],
            maxlength: [2000, 'Content cannot exceed 2000 characters'],
        },
        priority: {
            type: String,
            enum: ['low', 'normal', 'high', 'urgent'],
            default: 'normal',
        },
        category: {
            type: String,
            enum: ['general', 'hr', 'event', 'policy', 'achievement'],
            default: 'general',
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        expiresAt: {
            type: Date,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Creator is required'],
        },
        targetRoles: {
            type: [String],
            enum: ['user', 'employee', 'admin'],
            default: ['employee'],
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying
AnnouncementSchema.index({ isActive: 1, createdAt: -1 });
AnnouncementSchema.index({ priority: 1 });
AnnouncementSchema.index({ expiresAt: 1 });

// Virtual to check if announcement is expired
AnnouncementSchema.virtual('isExpired').get(function () {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
});

const Announcement: Model<IAnnouncement> =
    mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);

export default Announcement;
