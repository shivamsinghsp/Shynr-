const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const UserSchema = new mongoose.Schema({
    email: String,
    password: String,
    role: String
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function main() {
    console.log('Verifying Admin Password...');
    await mongoose.connect(process.env.MONGODB_URI);

    const email = 'shivam.sp2106@gmail.com';
    const passwordToTest = 'Shivam@2105';

    const user = await User.findOne({ email });

    if (!user) {
        console.log('User not found!');
    } else {
        console.log('User found:', user.email);
        console.log('Role:', user.role);
        console.log('Stored Hash:', user.password);

        const isMatch = await bcrypt.compare(passwordToTest, user.password);
        console.log(`Password '${passwordToTest}' matches:`, isMatch);

        if (!isMatch) {
            console.log('Generating new hash for', passwordToTest);
            const newHash = await bcrypt.hash(passwordToTest, 10);
            console.log('New Hash:', newHash);
            // Optional: Update it?
            // user.password = newHash;
            // await user.save();
            // console.log('Password updated.');
        }
    }

    await mongoose.disconnect();
}

main();
