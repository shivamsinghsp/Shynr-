import mongoose, { Schema, Document, Model } from 'mongoose';

// OTP types
export type OTPType = 'password_reset' | 'email_verification' | 'admin_login';

// OTP interface
export interface IOTP extends Document {
    email: string;
    otp: string;
    type: OTPType;
    expiresAt: Date;
    verified: boolean;
    attempts: number;
    createdAt: Date;
    updatedAt: Date;
}

const OTPSchema = new Schema<IOTP>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            trim: true,
        },
        otp: {
            type: String,
            required: [true, 'OTP is required'],
        },
        type: {
            type: String,
            enum: ['password_reset', 'email_verification', 'admin_login'],
            required: [true, 'OTP type is required'],
        },
        expiresAt: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
        },
        verified: {
            type: Boolean,
            default: false,
        },
        attempts: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
OTPSchema.index({ email: 1, type: 1 });
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-cleanup

// Static method to create a new OTP (deletes existing ones first)
OTPSchema.statics.createOTP = async function (
    email: string,
    otp: string,
    type: OTPType
): Promise<IOTP> {
    // Delete any existing OTPs for this email and type
    await this.deleteMany({ email: email.toLowerCase(), type });

    // Create new OTP
    return this.create({
        email: email.toLowerCase(),
        otp,
        type,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });
};

// Static method to verify OTP
OTPSchema.statics.verifyOTP = async function (
    email: string,
    otp: string,
    type: OTPType
): Promise<{ valid: boolean; message: string }> {
    const otpRecord = await this.findOne({
        email: email.toLowerCase(),
        type,
        verified: false,
    });

    if (!otpRecord) {
        return { valid: false, message: 'No OTP found. Please request a new one.' };
    }

    // Check if expired
    if (otpRecord.expiresAt < new Date()) {
        await otpRecord.deleteOne();
        return { valid: false, message: 'OTP has expired. Please request a new one.' };
    }

    // Check attempts (max 5)
    if (otpRecord.attempts >= 5) {
        await otpRecord.deleteOne();
        return { valid: false, message: 'Too many failed attempts. Please request a new OTP.' };
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        return { valid: false, message: `Invalid OTP. ${5 - otpRecord.attempts} attempts remaining.` };
    }

    // Mark as verified
    otpRecord.verified = true;
    await otpRecord.save();

    return { valid: true, message: 'OTP verified successfully.' };
};

// Interface for static methods
interface OTPModel extends Model<IOTP> {
    createOTP(email: string, otp: string, type: OTPType): Promise<IOTP>;
    verifyOTP(email: string, otp: string, type: OTPType): Promise<{ valid: boolean; message: string }>;
}

const OTP: OTPModel = (mongoose.models.OTP as OTPModel) || mongoose.model<IOTP, OTPModel>('OTP', OTPSchema);

export default OTP;
