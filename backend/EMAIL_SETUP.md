# Email Setup Guide

This guide will help you configure email functionality for email verification and password reset.

## Email Service Options

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password:**
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password

3. **Update `.env` file:**
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_APP_PASSWORD=your-16-character-app-password
   FRONTEND_URL=http://localhost:3000
   ```

### Option 2: SMTP (For Production)

Works with any email provider (Gmail, Outlook, SendGrid, etc.)

1. **Get SMTP credentials** from your email provider
2. **Update `.env` file:**
   ```env
   EMAIL_SERVICE=smtp
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-email-password
   FRONTEND_URL=https://your-production-domain.com
   ```

### Option 3: SendGrid (Recommended for Production)

1. **Sign up** at [SendGrid](https://sendgrid.com/)
2. **Create API Key** in SendGrid dashboard
3. **Update `.env` file:**
   ```env
   EMAIL_SERVICE=smtp
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=apikey
   EMAIL_PASSWORD=your-sendgrid-api-key
   FRONTEND_URL=https://your-production-domain.com
   ```

## Testing Email Configuration

After setting up your email, test it by:

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Sign up a new user** - you should receive a verification email

3. **Check your email inbox** (and spam folder)

## Email Features

### 1. Email Verification
- Sent automatically when user signs up
- Contains verification link (valid for 24 hours)
- User must verify before logging in

### 2. Resend Verification Email
- Endpoint: `POST /api/auth/resend-verification`
- Body: `{ "email": "user@example.com" }`

### 3. Password Reset
- Endpoint: `POST /api/auth/forgot-password`
- Body: `{ "email": "user@example.com" }`
- Sends reset link (valid for 1 hour)

### 4. Welcome Email
- Sent automatically after email verification
- Confirms successful account setup

## Troubleshooting

### Emails not sending

1. **Check email credentials** in `.env`
2. **Verify App Password** (for Gmail) is correct
3. **Check spam folder**
4. **Check server logs** for error messages
5. **Test SMTP connection:**
   ```bash
   node -e "require('dotenv').config(); const nodemailer = require('nodemailer'); const transporter = nodemailer.createTransport({service: 'gmail', auth: {user: process.env.EMAIL_USER, pass: process.env.EMAIL_APP_PASSWORD}}); transporter.verify().then(() => console.log('Email config OK')).catch(console.error);"
   ```

### Gmail App Password Issues

- Make sure 2FA is enabled
- Generate a new app password if old one doesn't work
- Use the 16-character app password, not your regular password

### Frontend URL

Make sure `FRONTEND_URL` in `.env` matches your frontend URL:
- Development: `http://localhost:3000`
- Production: `https://your-domain.com`

The email links will use this URL.

