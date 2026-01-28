// Standalone script to seed admin user
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://shivamsingh:Shivam123@cluster0.fk1nzqv.mongodb.net/Shynr-Production';

// User Schema (minimal version)
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    provider: { type: String, default: 'credentials' },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin', 'employee'], default: 'user' },
    onboardingCompleted: { type: Boolean, default: false },
    onboardingStep: { type: mongoose.Schema.Types.Mixed, default: 1 },
    emailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

async function seedAdmin() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        console.log('Database:', mongoose.connection.name);

        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        const adminEmail = 'shivam.sp2106@gmail.com';
        const adminPassword = 'Shivam@2105';

        console.log(`\nLooking for admin user: ${adminEmail}`);

        // Check if admin exists
        const existingUser = await User.findOne({ email: adminEmail });

        if (existingUser) {
            console.log('Found existing user. Updating to admin role...');
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            existingUser.password = hashedPassword;
            existingUser.role = 'admin';
            existingUser.onboardingCompleted = true;
            existingUser.onboardingStep = 'complete';
            existingUser.emailVerified = true;
            await existingUser.save();
            console.log('✅ User updated to admin role');
        } else {
            console.log('Creating new admin user...');
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await User.create({
                email: adminEmail,
                password: hashedPassword,
                firstName: 'Shivam',
                lastName: 'SP',
                role: 'admin',
                provider: 'credentials',
                onboardingCompleted: true,
                onboardingStep: 'complete',
                emailVerified: true
            });
            console.log('✅ Admin user created');
        }

        // Verify the user
        const verifyUser = await User.findOne({ email: adminEmail });
        console.log('\n📋 Admin User Details:');
        console.log('  Email:', verifyUser.email);
        console.log('  Role:', verifyUser.role);
        console.log('  Password Hash:', verifyUser.password ? 'Set (' + verifyUser.password.substring(0, 10) + '...)' : 'NOT SET');

        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
        console.log('\n🎉 Admin setup complete!');
        console.log('Login credentials:');
        console.log('  Email: shivam.sp2106@gmail.com');
        console.log('  Password: Shivam@2105');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

seedAdmin();
