import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send verification email to user
 * @param {string} email - User's email
 * @param {string} token - Verification token
 * @param {string} username - User's username
 * @returns {Promise<Object>} - Email send response
 */
export const sendVerificationEmail = async (email, token, username) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${token}`;
    try {    // Use the configured "from" address from environment variables if available,
    // otherwise fallback to a default Resend address
    const fromAddress = process.env.RESEND_FROM || 'onboarding@resend.dev';
    
    // With Resend, we need to send to the actual recipient's email
    // We'll log the verification URL in development mode for easy testing
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      console.log(`Sending verification email to: ${email}`);
      console.log(`Verification URL: ${verificationUrl}`);
      console.log(`If emails are not being delivered, check your Resend API settings and ensure the domain is verified.`);
    }
    
    const { data, error } = await resend.emails.send({
      from: `Print Spark Studio <${fromAddress}>`,
      to: [email], // Always send to the actual user's email
      subject: 'Verify your Print Spark Studio account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Print Spark Studio!</h2>
          <p>Hello ${username},</p>
          <p>Thank you for registering with Print Spark Studio. To complete your registration, please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
          </div>
          <p>If you did not create an account, please ignore this email.</p>
          <p>This verification link will expire in 24 hours.</p>
          <p>Best regards,<br>Print Spark Studio Team</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>
          <p style="font-size: 12px; color: #666; word-break: break-all;">${verificationUrl}</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending verification email:', error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
};
