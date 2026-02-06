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

export const sendWelcomeEmail = async (email: string, resetLink: string) => {
    const subject = 'Welcome to the Team! Set Up Your Account - Shynr';
    const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to the Team!</h2>
        <p>You have been promoted to an Employee role at Shynr.</p>
        <p>To access the employee portal, you need to set up a password for your account.</p>
        <p>Click the button below to set your password:</p>
        <a href="${resetLink}" style="display: inline-block; background: #05033e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Set Password</a>
        <p>Or use this link: <a href="${resetLink}">${resetLink}</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you have any questions, please contact the administrator.</p>
    </div>
    `;
    return sendEmail({ to: email, subject, html });
};

export const sendSubAdminPromotionEmail = async (email: string, resetLink: string) => {
    const subject = 'Congratulations! You are now a Sub Admin - Shynr';
    const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #05033e;">🎉 You Have Been Promoted to Sub Admin!</h2>
        <p>Great news! You have been promoted to a <strong>Sub Admin</strong> role at Shynr.</p>
        <p>As a Sub Admin, you now have elevated privileges to help manage the platform:</p>
        <ul style="background: #f8f9fa; padding: 16px 32px; border-radius: 8px; margin: 16px 0;">
            <li>Manage job listings (add, edit, delete)</li>
            <li>Manage employees and their information</li>
            <li>View attendance and operational data</li>
            <li>Perform day-to-day administrative tasks</li>
        </ul>
        <p>To access the admin portal, please set up your password by clicking the button below:</p>
        <a href="${resetLink}" style="display: inline-block; background: #05033e; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold;">Set Password & Access Portal</a>
        <p style="font-size: 14px; color: #666;">Or copy and paste this link: <a href="${resetLink}">${resetLink}</a></p>
        <p style="font-size: 14px; color: #888;">This link will expire in 24 hours for security reasons.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
        <p style="font-size: 13px; color: #999;">If you have any questions about your new role, please contact the Super Admin.</p>
    </div>
    `;
    return sendEmail({ to: email, subject, html });
};
