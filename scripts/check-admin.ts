
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

const checkAdmin = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminUser = await User.findOne({ email: 'admin@shynr.com' });

        if (adminUser) {
            console.log('Admin User Found:');
            console.log('Email:', adminUser.email);
            console.log('Role:', adminUser.role);
            console.log('Provider:', adminUser.provider);
        } else {
            console.log('Admin user NOT found');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkAdmin();
