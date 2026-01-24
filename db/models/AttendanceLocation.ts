import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttendanceLocation extends Document {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    radius: number; // in meters
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const AttendanceLocationSchema = new Schema<IAttendanceLocation>({
    name: {
        type: String,
        required: [true, 'Location name is required'],
        trim: true,
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
    },
    latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
    },
    longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
    },
    radius: {
        type: Number,
        required: true,
        default: 100, // Default 100 meters
        min: [10, 'Radius must be at least 10 meters'],
        max: [5000, 'Radius cannot exceed 5000 meters'],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

// Static method to find locations within range
AttendanceLocationSchema.statics.findNearby = async function (
    lat: number,
    lng: number
): Promise<{ location: IAttendanceLocation; distance: number } | null> {
    const locations = await this.find({ isActive: true });

    for (const location of locations) {
        const distance = calculateDistance(lat, lng, location.latitude, location.longitude);
        if (distance <= location.radius) {
            return { location, distance };
        }
    }

    return null;
};

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

export { calculateDistance };

interface AttendanceLocationModel extends Model<IAttendanceLocation> {
    findNearby(lat: number, lng: number): Promise<{ location: IAttendanceLocation; distance: number } | null>;
}

const AttendanceLocation = (mongoose.models.AttendanceLocation as AttendanceLocationModel) ||
    mongoose.model<IAttendanceLocation, AttendanceLocationModel>('AttendanceLocation', AttendanceLocationSchema);

export default AttendanceLocation;
