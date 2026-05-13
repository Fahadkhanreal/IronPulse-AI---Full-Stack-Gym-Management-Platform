import nodemailer from 'nodemailer';
import { success } from '../utils/response';

// Email configuration from environment
const smtpHost = process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com';
const smtpPort = parseInt(process.env.BREVO_SMTP_PORT || '587');
const smtpUser = process.env.BREVO_SMTP_USER || '';
const smtpPass = process.env.BREVO_SMTP_PASS || '';
const fromEmail = process.env.BREVO_FROM_EMAIL || 'noreply@ironpulse.gym';
const fromName = process.env.BREVO_FROM_NAME || 'IronPulse Gym';

console.log('📧 Email Config:', {
  host: smtpHost,
  port: smtpPort,
  user: smtpUser ? 'set' : 'not set',
  pass: smtpPass ? 'set' : 'not set',
  fromEmail
});

// Create transporter
const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: false,
  auth: {
    user: smtpUser,  // Use email as username
    pass: smtpPass,  // Use SMTP password
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailOptions) => {
  try {
    // If no SMTP password configured, just log and return (for testing)
    if (!smtpPass) {
      console.log('📧 Email (SMTP not configured):', { to, subject });
      console.log('📧 HTML:', html);
      return { success: true, message: 'Email logged (SMTP not configured)' };
    }

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html,
    });

    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📧 To:', to);
    console.log('📧 From:', fromEmail);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Email sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Password Reset Email Template
export const sendPasswordResetEmail = async (email: string, resetUrl: string) => {
  const subject = 'Reset Your IronPulse Gym Password';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Password</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="color: white; margin: 0;">🏋️ IronPulse Gym</h1>
      </div>

      <div style="padding: 30px; background: #f9f9f9; border-radius: 10px; margin-top: 20px;">
        <h2 style="color: #dc2626;">Reset Your Password</h2>

        <p>Hello,</p>

        <p>We received a request to reset your password. Click the button below to create a new password:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>

        <p style="font-size: 14px; color: #666;">
          Or copy and paste this link in your browser:<br>
          <span style="color: #dc2626;">${resetUrl}</span>
        </p>

        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px; font-size: 14px;">
          <strong>⚠️ Important:</strong>
          <ul style="margin: 10px 0 0 0; padding-left: 20px;">
            <li>This link will expire in 1 hour</li>
            <li>If you didn't request this, please ignore this email</li>
          </ul>
        </div>
      </div>

      <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
        <p>© 2026 IronPulse Gym. All rights reserved.</p>
        <p>This is an automated message, please do not reply.</p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
};

// Welcome Email Template
export const sendWelcomeEmail = async (email: string, name: string) => {
  const subject = 'Welcome to IronPulse Gym!';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="color: white; margin: 0;">🏋️ IronPulse Gym</h1>
      </div>

      <div style="padding: 30px; background: #f9f9f9; border-radius: 10px; margin-top: 20px;">
        <h2 style="color: #dc2626;">Welcome, ${name}!</h2>

        <p>Thank you for joining IronPulse Gym!</p>

        <p>Your account has been created successfully. You can now:</p>
        <ul>
          <li>Browse and subscribe to membership plans</li>
          <li>Book sessions with our expert trainers</li>
          <li>Use our AI chatbot for fitness queries</li>
          <li>Track your fitness journey</li>
        </ul>

        <p>Start your transformation today!</p>
      </div>

      <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
        <p>© 2026 IronPulse Gym. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
};

export default {
  sendEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
};