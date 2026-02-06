import { NextRequest, NextResponse } from 'next/server';
import { sendMail } from '@/lib/mail';

interface ContactFormData {
    firstName: string;
    lastName?: string;
    email: string;
    message: string;
    phone?: string;
    jobTitle?: string;
    jobId?: string;
}

export async function POST(req: NextRequest) {
    try {
        const body: ContactFormData = await req.json();

        // Validate required fields
        if (!body.firstName || !body.email || !body.message) {
            return NextResponse.json(
                { success: false, error: 'Name, email, and message are required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.email)) {
            return NextResponse.json(
                { success: false, error: 'Invalid email format' },
                { status: 400 }
            );
        }

        const fullName = body.lastName ? `${body.firstName} ${body.lastName}` : body.firstName;
        const isJobInquiry = !!body.jobTitle;

        // Create email subject
        const subject = isJobInquiry
            ? `🔔 Job Inquiry: ${body.jobTitle} from ${fullName}`
            : `🔔 New Contact Form Submission from ${fullName}`;

        // Create email HTML content
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
                            <p style="color: #a5b4fc; margin: 10px 0 0; font-size: 14px;">${isJobInquiry ? 'Job Inquiry' : 'New Contact Form Submission'}</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #05033e; margin: 0 0 20px; font-size: 24px;">📬 ${isJobInquiry ? 'Job Inquiry Received' : 'New Message Received'}</h2>
                            
                            ${isJobInquiry ? `
                            <!-- Job Info -->
                            <div style="background-color: #f0f7ff; border-left: 4px solid #05033e; padding: 15px 20px; border-radius: 0 12px 12px 0; margin-bottom: 20px;">
                                <p style="color: #6b7280; margin: 0 0 5px; font-size: 12px; text-transform: uppercase;">Job Position</p>
                                <p style="color: #05033e; margin: 0; font-size: 18px; font-weight: bold;">${body.jobTitle}</p>
                            </div>
                            ` : ''}
                            
                            <!-- Contact Details -->
                            <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 20px 0;">
                                <table width="100%" cellpadding="5" cellspacing="0">
                                    <tr>
                                        <td style="color: #6b7280; font-size: 14px; width: 100px;"><strong>Name:</strong></td>
                                        <td style="color: #05033e; font-size: 16px;">${fullName}</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #6b7280; font-size: 14px;"><strong>Email:</strong></td>
                                        <td style="color: #05033e; font-size: 16px;"><a href="mailto:${body.email}" style="color: #05033e;">${body.email}</a></td>
                                    </tr>
                                    ${body.phone ? `
                                    <tr>
                                        <td style="color: #6b7280; font-size: 14px;"><strong>Phone:</strong></td>
                                        <td style="color: #05033e; font-size: 16px;"><a href="tel:${body.phone}" style="color: #05033e;">${body.phone}</a></td>
                                    </tr>
                                    ` : ''}
                                </table>
                            </div>
                            
                            <!-- Message -->
                            <div style="margin: 30px 0;">
                                <p style="color: #6b7280; margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;"><strong>Message:</strong></p>
                                <div style="background-color: #f0f7ff; border-left: 4px solid #05033e; padding: 20px; border-radius: 0 12px 12px 0;">
                                    <p style="color: #4b5563; margin: 0; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${body.message}</p>
                                </div>
                            </div>
                            
                            <!-- Reply Button -->
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="mailto:${body.email}?subject=Re: ${isJobInquiry ? `Your inquiry about ${body.jobTitle}` : 'Your inquiry to SHYNR'}" style="display: inline-block; background: linear-gradient(135deg, #05033e 0%, #1a1a6e 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                                    Reply to ${body.firstName}
                                </a>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; margin: 0 0 10px; font-size: 14px;">This message was submitted via the SHYNR ${isJobInquiry ? 'Job Page' : 'Contact Form'}</p>
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

        // Send email to the admin/company email
        const adminEmail = process.env.CONTACT_EMAIL || process.env.SMTP_USER || 'info@shynr.in';

        const result = await sendMail({
            to: adminEmail,
            subject,
            html,
        });

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Your message has been sent successfully!'
            });
        } else if (result.devMode) {
            // In development mode without SMTP, still return success for testing
            console.log('📧 [DEV MODE] Contact form submission:', body);
            return NextResponse.json({
                success: true,
                message: 'Your message has been received! (Dev mode)',
                devMode: true
            });
        } else {
            return NextResponse.json(
                { success: false, error: 'Failed to send message. Please try again later.' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Contact form error:', error);
        return NextResponse.json(
            { success: false, error: 'An error occurred. Please try again later.' },
            { status: 500 }
        );
    }
}
