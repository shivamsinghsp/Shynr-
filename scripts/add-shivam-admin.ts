import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../db/models/User';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

const addAdmin = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminEmail = 'shivam.sp2106@gmail.com';
        const adminPassword = 'Shivam@2105';

        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            // Update existing user to admin role
            existingAdmin.role = 'admin';
            existingAdmin.password = await bcrypt.hash(adminPassword, 10);
            existingAdmin.onboardingCompleted = true;
            existingAdmin.onboardingStep = 'complete';
            existingAdmin.emailVerified = true;
            await existingAdmin.save();
            console.log('✅ User updated to admin role:', adminEmail);
        } else {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);

            const newAdmin = await User.create({
                email: adminEmail,
                password: hashedPassword,
                firstName: 'Shivam',
                lastName: 'Admin',
                role: 'admin',
                provider: 'credentials',
                onboardingCompleted: true,
                onboardingStep: 'complete',
                emailVerified: true
            });

            console.log('✅ Admin user created successfully:', newAdmin.email);
        }

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error adding admin:', error);
        process.exit(1);
    }
};

addAdmin();
