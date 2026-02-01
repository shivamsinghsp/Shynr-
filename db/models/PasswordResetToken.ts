import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPasswordResetToken extends Document {
    userId: mongoose.Types.ObjectId;
    userType: 'user' | 'admin';
    token: string;
    expiresAt: Date;
    createdAt: Date;
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        userType: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        token: {
            type: String,
            required: true,
            unique: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for auto-cleanup of expired tokens
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordResetToken: Model<IPasswordResetToken> =
    mongoose.models.PasswordResetToken ||
    mongoose.model<IPasswordResetToken>('PasswordResetToken', PasswordResetTokenSchema);

export default PasswordResetToken;
