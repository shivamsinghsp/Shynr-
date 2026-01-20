import mongoose, { Schema, Document, Model } from 'mongoose';

// Permissions interface
interface IPermissions {
    createJob: boolean;
    editJob: boolean;
    deleteJob: boolean;
    publishJob: boolean;
    viewUsers: boolean;
    editUsers: boolean;
    deleteUsers: boolean;
    viewApplications: boolean;
    updateApplicationStatus: boolean;
    manageAdmins: boolean;
    manageContent: boolean;
}

// Main Admin interface
export interface IAdmin extends Document {
    email: string;
    password: string;

    firstName: string;
    lastName: string;
    profileImage?: string;
    phone?: string;

    role: 'super_admin' | 'admin' | 'moderator' | 'viewer';
    permissions: IPermissions;

    isActive: boolean;
    lastLoginAt?: Date;

    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

// Default permissions by role
export const defaultPermissions: Record<string, IPermissions> = {
    super_admin: {
        createJob: true,
        editJob: true,
        deleteJob: true,
        publishJob: true,
        viewUsers: true,
        editUsers: true,
        deleteUsers: true,
        viewApplications: true,
        updateApplicationStatus: true,
        manageAdmins: true,
        manageContent: true,
    },
    admin: {
        createJob: true,
        editJob: true,
        deleteJob: true,
        publishJob: true,
        viewUsers: true,
        editUsers: true,
        deleteUsers: false,
        viewApplications: true,
        updateApplicationStatus: true,
        manageAdmins: false,
        manageContent: true,
    },
    moderator: {
        createJob: true,
        editJob: true,
        deleteJob: false,
        publishJob: false,
        viewUsers: true,
        editUsers: false,
        deleteUsers: false,
        viewApplications: true,
        updateApplicationStatus: true,
        manageAdmins: false,
        manageContent: false,
    },
    viewer: {
        createJob: false,
        editJob: false,
        deleteJob: false,
        publishJob: false,
        viewUsers: true,
        editUsers: false,
        deleteUsers: false,
        viewApplications: true,
        updateApplicationStatus: false,
        manageAdmins: false,
        manageContent: false,
    },
};

const PermissionsSchema = new Schema<IPermissions>({
    createJob: { type: Boolean, default: false },
    editJob: { type: Boolean, default: false },
    deleteJob: { type: Boolean, default: false },
    publishJob: { type: Boolean, default: false },
    viewUsers: { type: Boolean, default: false },
    editUsers: { type: Boolean, default: false },
    deleteUsers: { type: Boolean, default: false },
    viewApplications: { type: Boolean, default: false },
    updateApplicationStatus: { type: Boolean, default: false },
    manageAdmins: { type: Boolean, default: false },
    manageContent: { type: Boolean, default: false },
});

const AdminSchema = new Schema<IAdmin>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: { type: String, required: [true, 'Password is required'] },

        firstName: { type: String, required: [true, 'First name is required'] },
        lastName: { type: String, required: [true, 'Last name is required'] },
        profileImage: { type: String },
        phone: { type: String },

        role: {
            type: String,
            enum: ['super_admin', 'admin', 'moderator', 'viewer'],
            default: 'viewer',
        },
        permissions: { type: PermissionsSchema, required: true },

        isActive: { type: Boolean, default: true },
        lastLoginAt: { type: Date },

        createdBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    },
    {
        timestamps: true,
    }
);

// Indexes
AdminSchema.index({ email: 1 });
AdminSchema.index({ role: 1 });

const Admin: Model<IAdmin> = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;
