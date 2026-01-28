import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

export const sendEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
    try {
        const info = await transporter.sendMail({
            from: `"Shynr Support" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
};

export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
    const subject = 'Reset Your Password - Shynr';
    const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password for your Shynr account.</p>
        <p>Click the button below to reset it:</p>
        <a href="${resetLink}" style="display: inline-block; background: #05033e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Reset Password</a>
        <p>Or verify using this link: <a href="${resetLink}">${resetLink}</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
    </div>
    `;
    return sendEmail({ to: email, subject, html });
};

export const sendOTP = async (email: string, otp: string) => {
    const subject = 'Your Verification Code - Shynr';
    const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verification Code</h2>
        <p>Your verification code is:</p>
        <div style="background: #f4f4f5; padding: 24px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #05033e; margin: 24px 0;">
            ${otp}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
    </div>
    `;
    return sendEmail({ to: email, subject, html });
};
