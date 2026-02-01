
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

// Load env vars from the root .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import dns from 'dns';
try { dns.setServers(['8.8.8.8', '8.8.4.4']); } catch (e) { }

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in .env');
    process.exit(1);
}

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    role: { type: String, default: 'user' },
    firstName: String,
    lastName: String,
    // Add other fields to avoid schema errors if strict
}, { strict: false });

// Prevent overwriting model if already compiled
const User = mongoose.models.User || mongoose.model('User', userSchema);

async function setUserRole(email: string, role: string) {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected.');

        const normalizedEmail = email.toLowerCase();
        console.log(`Searching for user: ${normalizedEmail}`);

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            console.error(`User not found: ${normalizedEmail}`);
            // List all users to help debug
            const allUsers = await User.find({}, 'email role');
            console.log('Available users:', allUsers.map(u => `${u.email} (${u.role})`));
            process.exit(1);
        }

        console.log(`User found: ${user.email} (Current Role: ${user.role})`);

        user.role = role;
        await user.save();

        console.log(`SUCCESS: User ${user.email} is now: ${role.toUpperCase()}`);
        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

// Get args
const emailArg = process.argv[2];
const roleArg = process.argv[3];

const validRoles = ['user', 'employee', 'admin'];

if (!emailArg || (roleArg && !validRoles.includes(roleArg))) {
    console.error('Usage: npx tsx scripts/set_role.ts <email> [role]');
    console.error(`Valid roles: ${validRoles.join(', ')} (default: admin)`);
    process.exit(1);
}

setUserRole(emailArg, roleArg || 'admin');
