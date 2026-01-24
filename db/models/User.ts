import mongoose, { Schema, Document, Model } from 'mongoose';

// Education subdocument interface
interface IEducation {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
    description?: string;
}

// Experience subdocument interface
interface IExperience {
    company: string;
    title: string;
    location?: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
    description?: string;
}

// Address subdocument interface
interface IAddress {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
}

// Resume subdocument interface
interface IResume {
    url: string;
    filename: string;
    uploadedAt: Date;
}

// Main User interface
export interface IUser extends Document {
    email: string;
    password?: string;
    provider: 'credentials' | 'google' | 'linkedin';
    providerId?: string;

    firstName: string;
    lastName: string;
    phone?: string;
    profileImage?: string;

    linkedin?: string;
    portfolio?: string;

    address?: IAddress;
    location?: string;

    headline?: string;
    summary?: string;

    education?: IEducation[];
    experience?: IExperience[];
    skills?: string[];

    resume?: IResume;

    onboardingCompleted: boolean;
    onboardingStep: 1 | 2 | 3 | 'complete';
    profileCompleteness: number;
    role: 'user' | 'admin' | 'employee';

    isActive: boolean;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
}

const EducationSchema = new Schema<IEducation>({
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    current: { type: Boolean, default: false },
    description: { type: String },
});

const ExperienceSchema = new Schema<IExperience>({
    company: { type: String, required: true },
    title: { type: String, required: true },
    location: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    current: { type: Boolean, default: false },
    description: { type: String },
});

const AddressSchema = new Schema<IAddress>({
    street: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    zipCode: { type: String },
});

const ResumeSchema = new Schema<IResume>({
    url: { type: String, required: true },
    filename: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
});

const UserSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: { type: String },
        provider: {
            type: String,
            enum: ['credentials', 'google', 'linkedin'],
            default: 'credentials',
        },
        providerId: { type: String },

        firstName: { type: String, default: '' },
        lastName: { type: String, default: '' },
        phone: { type: String },
        profileImage: { type: String },

        linkedin: { type: String },
        portfolio: { type: String },

        address: AddressSchema,
        location: { type: String },

        headline: { type: String },
        summary: { type: String },

        education: [EducationSchema],
        experience: [ExperienceSchema],
        skills: [{ type: String }],

        resume: ResumeSchema,

        onboardingCompleted: { type: Boolean, default: false },
        onboardingStep: { type: Schema.Types.Mixed, default: 1 },
        profileCompleteness: { type: Number, default: 0 },

        role: {
            type: String,
            enum: ['user', 'admin', 'employee'],
            default: 'user'
        },

        isActive: { type: Boolean, default: true },
        emailVerified: { type: Boolean, default: false },
        lastLoginAt: { type: Date },
    },
    {
        timestamps: true,
    }
);

// Indexes
UserSchema.index({ provider: 1, providerId: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
