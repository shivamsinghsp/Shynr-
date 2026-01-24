import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IAttendance extends Document {
    user: Types.ObjectId;
    date: Date;
    checkIn: Date;
    checkOut?: Date;
    checkInLocation: {
        latitude: number;
        longitude: number;
        locationId: Types.ObjectId;
        locationName: string;
        distance: number; // Distance from location center in meters
    };
    checkOutLocation?: {
        latitude: number;
        longitude: number;
        locationId: Types.ObjectId;
        locationName: string;
        distance: number;
    };
    status: 'checked-in' | 'checked-out';
    workHours?: number; // Calculated work hours
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    date: {
        type: Date,
        required: true,
        index: true,
    },
    checkIn: {
        type: Date,
        required: true,
    },
    checkOut: {
        type: Date,
    },
    checkInLocation: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        locationId: { type: Schema.Types.ObjectId, ref: 'AttendanceLocation', required: true },
        locationName: { type: String, required: true },
        distance: { type: Number, required: true },
    },
    checkOutLocation: {
        latitude: { type: Number },
        longitude: { type: Number },
        locationId: { type: Schema.Types.ObjectId, ref: 'AttendanceLocation' },
        locationName: { type: String },
        distance: { type: Number },
    },
    status: {
        type: String,
        enum: ['checked-in', 'checked-out'],
        default: 'checked-in',
    },
    workHours: {
        type: Number,
    },
    notes: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});

// Compound index for user and date to ensure one attendance per day
AttendanceSchema.index({ user: 1, date: 1 }, { unique: true });

// Calculate work hours when checking out
AttendanceSchema.pre('save', function () {
    if (this.checkOut && this.checkIn) {
        const diff = this.checkOut.getTime() - this.checkIn.getTime();
        this.workHours = Math.round((diff / (1000 * 60 * 60)) * 100) / 100; // Hours with 2 decimal places
    }
});

// Static method to get today's attendance for a user
AttendanceSchema.statics.getTodayAttendance = async function (userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.findOne({
        user: userId,
        date: { $gte: today, $lt: tomorrow }
    });
};

interface AttendanceModel extends Model<IAttendance> {
    getTodayAttendance(userId: string): Promise<IAttendance | null>;
}

const Attendance = (mongoose.models.Attendance as AttendanceModel) ||
    mongoose.model<IAttendance, AttendanceModel>('Attendance', AttendanceSchema);

export default Attendance;
