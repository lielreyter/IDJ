const nodemailer = require('nodemailer');

// Create transporter (configure based on your email provider)
const createTransporter = () => {
  // Option 1: Gmail (for development)
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD, // Use App Password, not regular password
      },
    });
  }

  // Option 2: SMTP (for production - works with any email provider)
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_APP_PASSWORD,
    },
  });
};

// Send email verification
exports.sendVerificationEmail = async (email, token, username) => {
  const transporter = createTransporter();
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${token}`;

  const mailOptions = {
    from: `"IDJ" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email - IDJ',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #000; color: #fff; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 12px 30px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>IDJ</h1>
            </div>
            <div class="content">
              <h2>Welcome, ${username}!</h2>
              <p>Thank you for signing up for IDJ. Please verify your email address to complete your registration.</p>
              <p>Click the button below to verify your email:</p>
              <a href="${verificationUrl}" class="button">Verify Email</a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't create an account, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} IDJ. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Welcome to IDJ, ${username}!
      
      Please verify your email address by clicking the following link:
      ${verificationUrl}
      
      This link will expire in 24 hours.
      
      If you didn't create an account, please ignore this email.
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw error;
  }
};

// Send password reset email
exports.sendPasswordResetEmail = async (email, token, username) => {
  const transporter = createTransporter();
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;

  const mailOptions = {
    from: `"IDJ" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Password - IDJ',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #000; color: #fff; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { display: inline-block; padding: 12px 30px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>IDJ</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hello ${username},</p>
              <p>We received a request to reset your password for your IDJ account.</p>
              <p>Click the button below to reset your password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${resetUrl}</p>
              <div class="warning">
                <strong>⚠️ Important:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
              </div>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} IDJ. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Password Reset Request
      
      Hello ${username},
      
      We received a request to reset your password for your IDJ account.
      
      Click the following link to reset your password:
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request a password reset, please ignore this email.
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw error;
  }
};

// Send welcome email (for OAuth users or after email verification)
exports.sendWelcomeEmail = async (email, username) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"IDJ" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to IDJ!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #000; color: #fff; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>IDJ</h1>
            </div>
            <div class="content">
              <h2>Welcome to IDJ, ${username}!</h2>
              <p>Your account has been successfully verified. You're all set to start spinning!</p>
              <p>Get started by exploring the app and sharing your mixes with the community.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} IDJ. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    // Don't throw error for welcome email - it's not critical
    return false;
  }
};

