const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} = require('../utils/emailService');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Register new user
exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: existingUser.email === email
          ? 'Email already registered'
          : 'Username already taken',
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      provider: 'local',
    });

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationToken, user.username);
    } catch (error) {
      console.error('Error sending verification email:', error);
      // Don't fail signup if email fails, but log it
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
      token,
      message: 'Account created. Please check your email to verify your account.',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email, provider: 'local' });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        error: 'Please verify your email before logging in. Check your inbox for the verification link.',
        requiresVerification: true,
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// OAuth login/signup (Google/Apple)
exports.oauthLogin = async (req, res) => {
  try {
    const { email, username, provider, providerId } = req.body;

    // Find or create user
    let user = await User.findOne({
      $or: [
        { email, provider },
        { providerId, provider },
      ],
    });

    if (!user) {
      // Create new OAuth user
      user = await User.create({
        email,
        username: username || email.split('@')[0],
        provider,
        providerId,
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        provider: user.provider,
      },
      token,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with this token and check if it's not expired
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token',
      });
    }

    // Verify the email
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.username);
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }

    res.json({
      success: true,
      message: 'Email verified successfully!',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Resend verification email
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email, provider: 'local' });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email is already verified',
      });
    }

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken, user.username);

    res.json({
      success: true,
      message: 'Verification email sent. Please check your inbox.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Request password reset
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email, provider: 'local' });

    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Generate password reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken, user.username);
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      throw error;
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with this token and check if it's not expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired password reset token',
      });
    }

    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters',
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

