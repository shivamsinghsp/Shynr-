import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable');
    process.exit(1);
}

// Define Admin schema inline to avoid import issues
const PermissionsSchema = new mongoose.Schema({
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

const AdminSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        profileImage: { type: String },
        phone: { type: String },
        role: { type: String, enum: ['super_admin', 'admin', 'moderator', 'viewer'], default: 'viewer' },
        permissions: { type: PermissionsSchema, required: true },
        isActive: { type: Boolean, default: true },
        lastLoginAt: { type: Date },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    },
    { timestamps: true }
);

const superAdminPermissions = {
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
};

const createAdmin = async () => {
    try {
        await mongoose.connect(MONGODB_URI!);
        console.log('Connected to MongoDB');

        const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

        const adminEmail = 'shivamsinghabc439@gmail.com';
        const adminPassword = 'Shivam@2105';

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin already exists, updating password...');
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            existingAdmin.password = hashedPassword;
            existingAdmin.role = 'super_admin';
            existingAdmin.permissions = superAdminPermissions;
            existingAdmin.isActive = true;
            await existingAdmin.save();
            console.log('Admin updated successfully:');
            console.log('Email:', existingAdmin.email);
            console.log('Role:', existingAdmin.role);
            console.log('ID:', existingAdmin._id);
        } else {
            console.log('Creating new admin...');
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            const newAdmin = await Admin.create({
                email: adminEmail,
                password: hashedPassword,
                firstName: 'Shivam',
                lastName: 'Singh',
                role: 'super_admin',
                permissions: superAdminPermissions,
                isActive: true
            });
            console.log('Created new admin successfully:');
            console.log('Email:', newAdmin.email);
            console.log('Role:', newAdmin.role);
            console.log('ID:', newAdmin._id);
        }

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
