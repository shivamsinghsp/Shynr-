import nodemailer from 'nodemailer';

// Check if SMTP is configured
const isSmtpConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASSWORD);

// SMTP Configuration from environment variables
const transporter = isSmtpConfigured ? nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
}) : null;

// Verify transporter configuration (only if configured)
if (transporter) {
    transporter.verify((error) => {
        if (error) {
            console.error('SMTP Configuration Error:', error);
        } else {
            console.log('✅ SMTP Server is ready to send emails');
        }
    });
} else {
    console.log('⚠️ SMTP not configured - Running in development mode (OTP will be shown in response)');
}

interface SendMailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

/**
 * Send an email using Nodemailer
 * Returns { success: false, devMode: true } if SMTP is not configured
 */
export async function sendMail({ to, subject, html, text }: SendMailOptions): Promise<{ success: boolean; messageId?: string; error?: unknown; devMode?: boolean }> {
    // If SMTP is not configured, return devMode flag
    if (!transporter) {
        console.log(`📧 [DEV MODE] Would send email to: ${to}`);
        console.log(`📧 [DEV MODE] Subject: ${subject}`);
        return { success: false, devMode: true };
    }

    try {
        const info = await transporter.sendMail({
            from: `"${process.env.SMTP_FROM_NAME || 'SHYNR'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
            to,
            subject,
            text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
            html,
        });

        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
}

/**
 * Check if SMTP is configured
 */
export function isEmailConfigured(): boolean {
    return isSmtpConfigured;
}

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP email for password reset
 */
export async function sendPasswordResetOTP(email: string, otp: string, userName?: string) {
    const subject = 'Password Reset OTP - SHYNR';
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #05033e 0%, #1a1a6e 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">SHYNR</h1>
                            <p style="color: #a5b4fc; margin: 10px 0 0; font-size: 14px;">Your Career Partner</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #05033e; margin: 0 0 20px; font-size: 24px;">Password Reset Request</h2>
                            <p style="color: #4b5563; margin: 0 0 20px; font-size: 16px; line-height: 1.6;">
                                Hello${userName ? ` ${userName}` : ''},
                            </p>
                            <p style="color: #4b5563; margin: 0 0 30px; font-size: 16px; line-height: 1.6;">
                                We received a request to reset your password. Use the OTP below to proceed with resetting your password:
                            </p>
                            
                            <!-- OTP Box -->
                            <div style="background-color: #f0f7ff; border: 2px dashed #05033e; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                                <p style="color: #6b7280; margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your OTP Code</p>
                                <p style="color: #05033e; margin: 0; font-size: 40px; font-weight: bold; letter-spacing: 8px;">${otp}</p>
                            </div>
                            
                            <p style="color: #ef4444; margin: 0 0 20px; font-size: 14px;">
                                ⚠️ This OTP will expire in <strong>10 minutes</strong>. Do not share this code with anyone.
                            </p>
                            
                            <p style="color: #4b5563; margin: 0; font-size: 14px; line-height: 1.6;">
                                If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; margin: 0 0 10px; font-size: 14px;">Need help? Contact us at support@shynr.com</p>
                            <p style="color: #9ca3af; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} SHYNR. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    return sendMail({ to: email, subject, html });
}

/**
 * Send OTP email for email verification
 */
export async function sendEmailVerificationOTP(email: string, otp: string, userName?: string) {
    const subject = 'Verify Your Email - SHYNR';
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #05033e 0%, #1a1a6e 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">SHYNR</h1>
                            <p style="color: #a5b4fc; margin: 10px 0 0; font-size: 14px;">Your Career Partner</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #05033e; margin: 0 0 20px; font-size: 24px;">Verify Your Email</h2>
                            <p style="color: #4b5563; margin: 0 0 20px; font-size: 16px; line-height: 1.6;">
                                Hello${userName ? ` ${userName}` : ''},
                            </p>
                            <p style="color: #4b5563; margin: 0 0 30px; font-size: 16px; line-height: 1.6;">
                                Thank you for signing up with SHYNR! Please use the OTP below to verify your email address:
                            </p>
                            
                            <!-- OTP Box -->
                            <div style="background-color: #f0fdf4; border: 2px dashed #22c55e; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                                <p style="color: #6b7280; margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                                <p style="color: #15803d; margin: 0; font-size: 40px; font-weight: bold; letter-spacing: 8px;">${otp}</p>
                            </div>
                            
                            <p style="color: #ef4444; margin: 0 0 20px; font-size: 14px;">
                                ⚠️ This OTP will expire in <strong>10 minutes</strong>. Do not share this code with anyone.
                            </p>
                            
                            <p style="color: #4b5563; margin: 0; font-size: 14px; line-height: 1.6;">
                                If you didn't create an account with SHYNR, please ignore this email.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; margin: 0 0 10px; font-size: 14px;">Need help? Contact us at support@shynr.com</p>
                            <p style="color: #9ca3af; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} SHYNR. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    return sendMail({ to: email, subject, html });
}

/**
 * Send OTP email for admin login verification
 */
export async function sendAdminLoginOTP(email: string, otp: string, adminName?: string) {
    const subject = 'Admin Login OTP - SHYNR';
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #7c2d12 0%, #b91c1c 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">SHYNR Admin</h1>
                            <p style="color: #fecaca; margin: 10px 0 0; font-size: 14px;">Secure Access Portal</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #7c2d12; margin: 0 0 20px; font-size: 24px;">Admin Login Verification</h2>
                            <p style="color: #4b5563; margin: 0 0 20px; font-size: 16px; line-height: 1.6;">
                                Hello${adminName ? ` ${adminName}` : ' Admin'},
                            </p>
                            <p style="color: #4b5563; margin: 0 0 30px; font-size: 16px; line-height: 1.6;">
                                A login attempt was made to your admin account. Use the OTP below to complete the login:
                            </p>
                            
                            <!-- OTP Box -->
                            <div style="background-color: #fef2f2; border: 2px dashed #b91c1c; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                                <p style="color: #6b7280; margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Admin OTP</p>
                                <p style="color: #b91c1c; margin: 0; font-size: 40px; font-weight: bold; letter-spacing: 8px;">${otp}</p>
                            </div>
                            
                            <p style="color: #ef4444; margin: 0 0 20px; font-size: 14px;">
                                ⚠️ This OTP will expire in <strong>10 minutes</strong>. Do not share this code with anyone.
                            </p>
                            
                            <p style="color: #4b5563; margin: 0; font-size: 14px; line-height: 1.6;">
                                If you didn't attempt to login, please secure your account immediately and contact the system administrator.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; margin: 0 0 10px; font-size: 14px;">SHYNR Admin Portal</p>
                            <p style="color: #9ca3af; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} SHYNR. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    return sendMail({ to: email, subject, html });
}

/**
 * Send email notification when application status changes
 */
export async function sendApplicationStatusEmail(
    email: string,
    userName: string,
    jobTitle: string,
    company: string,
    newStatus: string,
    statusMessage?: string
) {
    const statusConfig: Record<string, { color: string; bgColor: string; icon: string; title: string }> = {
        'pending': { color: '#854d0e', bgColor: '#fef3c7', icon: '⏳', title: 'Application Received' },
        'reviewed': { color: '#1e40af', bgColor: '#dbeafe', icon: '👀', title: 'Application Reviewed' },
        'shortlisted': { color: '#7c3aed', bgColor: '#ede9fe', icon: '⭐', title: 'You\'ve Been Shortlisted!' },
        'interview': { color: '#0891b2', bgColor: '#cffafe', icon: '📅', title: 'Interview Scheduled' },
        'offered': { color: '#059669', bgColor: '#d1fae5', icon: '🎉', title: 'Congratulations! Job Offer' },
        'rejected': { color: '#dc2626', bgColor: '#fee2e2', icon: '📋', title: 'Application Update' },
        'withdrawn': { color: '#6b7280', bgColor: '#f3f4f6', icon: '↩️', title: 'Application Withdrawn' },
    };

    const config = statusConfig[newStatus] || statusConfig['pending'];
    const subject = `${config.icon} ${config.title} - ${jobTitle} at ${company}`;

    const statusMessages: Record<string, string> = {
        'pending': 'Your application has been received and is being processed.',
        'reviewed': 'Great news! Your application has been reviewed by our team.',
        'shortlisted': 'Congratulations! You have been shortlisted for the next round.',
        'interview': 'We would like to invite you for an interview. Our team will contact you shortly with details.',
        'offered': 'We are pleased to offer you the position! Our HR team will reach out with the offer details.',
        'rejected': 'After careful consideration, we have decided to move forward with other candidates. We encourage you to apply for other positions.',
        'withdrawn': 'Your application has been withdrawn as requested.',
    };

    const message = statusMessage || statusMessages[newStatus] || 'Your application status has been updated.';

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #05033e 0%, #1a1a6e 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">SHYNR</h1>
                            <p style="color: #a5b4fc; margin: 10px 0 0; font-size: 14px;">Your Career Partner</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #05033e; margin: 0 0 20px; font-size: 24px;">${config.title}</h2>
                            <p style="color: #4b5563; margin: 0 0 20px; font-size: 16px; line-height: 1.6;">
                                Hello ${userName},
                            </p>
                            
                            <!-- Job Info Card -->
                            <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0;">
                                <p style="color: #6b7280; margin: 0 0 5px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Position Applied</p>
                                <p style="color: #05033e; margin: 0 0 5px; font-size: 18px; font-weight: bold;">${jobTitle}</p>
                                <p style="color: #6b7280; margin: 0; font-size: 14px;">at ${company}</p>
                            </div>
                            
                            <!-- Status Badge -->
                            <div style="text-align: center; margin: 30px 0;">
                                <span style="display: inline-block; background-color: ${config.bgColor}; color: ${config.color}; padding: 12px 24px; border-radius: 50px; font-size: 16px; font-weight: 600; text-transform: capitalize;">
                                    ${config.icon} ${newStatus.replace('_', ' ')}
                                </span>
                            </div>
                            
                            <p style="color: #4b5563; margin: 20px 0; font-size: 16px; line-height: 1.6;">
                                ${message}
                            </p>
                            
                            <!-- CTA Button -->
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${process.env.NEXTAUTH_URL}/applications" style="display: inline-block; background: linear-gradient(135deg, #05033e 0%, #1a1a6e 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                                    View Your Applications
                                </a>
                            </div>
                            
                            <p style="color: #6b7280; margin: 30px 0 0; font-size: 14px; line-height: 1.6;">
                                Thank you for your interest in career opportunities with us. We appreciate the time you invested in applying.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; margin: 0 0 10px; font-size: 14px;">Need help? Contact us at support@shynr.com</p>
                            <p style="color: #9ca3af; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} SHYNR. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    return sendMail({ to: email, subject, html });
}
