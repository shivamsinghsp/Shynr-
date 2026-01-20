
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

const seedAdmin = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@shynr.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin user already exists');
        } else {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);

            const newAdmin = await User.create({
                email: adminEmail,
                password: hashedPassword,
                firstName: 'Super',
                lastName: 'Admin',
                role: 'admin',
                provider: 'credentials',
                onboardingCompleted: true,
                onboardingStep: 'complete',
                emailVerified: true
            });

            console.log('Admin user created successfully:', newAdmin.email);
        }

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
