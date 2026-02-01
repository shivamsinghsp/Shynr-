/**
 * Secure Admin Setup Script
 * Run locally with: npx ts-node --project tsconfig.seed.json scripts/setup-admin.ts
 * 
 * This script creates or updates an admin user in the database.
 * It should NEVER be exposed as an API endpoint.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dns from 'dns';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Force Google DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Admin credentials - change these!
const ADMIN_EMAIL = 'shynr@gmail.com';
const ADMIN_PASSWORD = 'Admin@123';

async function setupAdmin() {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI not found in environment variables');
        process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        console.log(`📁 Database: ${mongoose.connection.name}`);

        // Get the User model
        const UserSchema = new mongoose.Schema({
            email: { type: String, required: true, unique: true, lowercase: true },
            password: { type: String },
            provider: { type: String, default: 'credentials' },
            firstName: { type: String, default: '' },
            lastName: { type: String, default: '' },
            role: { type: String, default: 'user' },
            onboardingCompleted: { type: Boolean, default: false },
            onboardingStep: { type: mongoose.Schema.Types.Mixed, default: 1 },
            emailVerified: { type: Boolean, default: false },
            isActive: { type: Boolean, default: true },
        }, { timestamps: true });

        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        // Hash the password
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

        // Check if user exists
        let user = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

        if (user) {
            console.log(`📝 User ${ADMIN_EMAIL} exists, updating...`);
            user.password = hashedPassword;
            user.role = 'admin';
            user.provider = 'credentials';
            user.onboardingCompleted = true;
            user.onboardingStep = 'complete';
            user.emailVerified = true;
            user.isActive = true;
            await user.save();
            console.log('✅ Admin user updated successfully!');
        } else {
            console.log(`➕ Creating new admin user: ${ADMIN_EMAIL}`);
            await User.create({
                email: ADMIN_EMAIL.toLowerCase(),
                password: hashedPassword,
                firstName: 'Super',
                lastName: 'Admin',
                role: 'admin',
                provider: 'credentials',
                onboardingCompleted: true,
                onboardingStep: 'complete',
                emailVerified: true,
                isActive: true,
            });
            console.log('✅ Admin user created successfully!');
        }

        console.log('\n📋 Admin Credentials:');
        console.log(`   Email: ${ADMIN_EMAIL}`);
        console.log(`   Password: ${ADMIN_PASSWORD}`);
        console.log('\n⚠️  Important: Change this password after first login!');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

setupAdmin();
