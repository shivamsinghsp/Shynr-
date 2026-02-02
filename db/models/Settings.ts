import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
    key: string;

    // Attendance Time Settings
    checkInStartHour: number;   // e.g., 10 for 10:00 AM
    checkInEndHour: number;     // e.g., 11 for 11:00 AM
    checkOutStartHour: number;  // e.g., 19 for 7:00 PM

    updatedBy?: mongoose.Types.ObjectId;
    updatedAt: Date;
    createdAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            default: 'attendance',
        },

        // Attendance Time Settings
        checkInStartHour: {
            type: Number,
            default: 10,
            min: 0,
            max: 23,
        },
        checkInEndHour: {
            type: Number,
            default: 11,
            min: 0,
            max: 23,
        },
        checkOutStartHour: {
            type: Number,
            default: 19,
            min: 0,
            max: 23,
        },

        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'Admin',
        },
    },
    {
        timestamps: true,
    }
);

// Ensure only one settings document exists
SettingsSchema.index({ key: 1 }, { unique: true });

// Helper function to get or create settings
SettingsSchema.statics.getSettings = async function (): Promise<ISettings> {
    let settings = await this.findOne({ key: 'attendance' });

    if (!settings) {
        settings = await this.create({
            key: 'attendance',
            checkInStartHour: 10,
            checkInEndHour: 11,
            checkOutStartHour: 19,
        });
    }

    return settings;
};

interface SettingsModel extends Model<ISettings> {
    getSettings(): Promise<ISettings>;
}

const Settings: SettingsModel = (mongoose.models.Settings as any) || mongoose.model<ISettings, SettingsModel>('Settings', SettingsSchema);

export default Settings;
