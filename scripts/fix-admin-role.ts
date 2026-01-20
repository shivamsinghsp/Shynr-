
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../db/models/User';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable');
    process.exit(1);
}

const fixAdmin = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminEmail = 'admin@shynr.com';

        const result = await User.findOneAndUpdate(
            { email: adminEmail },
            { $set: { role: 'admin' } },
            { new: true }
        );

        if (result) {
            console.log('Successfully updated user role to admin:');
            console.log('Email:', result.email);
            console.log('Role:', result.role);
            console.log('ID:', result._id);
        } else {
            console.log('Admin user not found, creating one...');
            // Need to create it if it doesn't exist (fallback)
            const bcrypt = require('bcryptjs'); // lazy load
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const newAdmin = await User.create({
                email: adminEmail,
                password: hashedPassword,
                firstName: 'Super',
                lastName: 'Admin',
                role: 'admin',
                provider: 'credentials',
                onboardingCompleted: true
            });
            console.log('Created new admin:', newAdmin.email);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error fixing admin:', error);
        process.exit(1);
    }
};

fixAdmin();
