const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
    console.log('Testing SMTP Configuration...');
    console.log('Host:', process.env.SMTP_HOST);
    console.log('Port:', process.env.SMTP_PORT);
    console.log('User:', process.env.SMTP_USER);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    try {
        const info = await transporter.sendMail({
            from: `"Test Script" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER, // Send to self
            subject: "Test Email from Shynr Script",
            text: "If you receive this, your SMTP configuration is working correctly.",
            html: "<b>SMTP is working!</b>",
        });

        console.log("Message sent: %s", info.messageId);
        console.log("Check your inbox at:", process.env.SMTP_USER);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

main();
