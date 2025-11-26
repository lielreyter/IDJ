const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  oauthLogin,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', signup);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   POST /api/auth/oauth
// @desc    OAuth login/signup (Google/Apple)
// @access  Public
router.post('/oauth', oauthLogin);

// @route   GET /api/auth/verify-email/:token
// @desc    Verify email address
// @access  Public
router.get('/verify-email/:token', verifyEmail);

// @route   POST /api/auth/resend-verification
// @desc    Resend verification email
// @access  Public
router.post('/resend-verification', resendVerificationEmail);

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', forgotPassword);

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password with token
// @access  Public
router.post('/reset-password/:token', resetPassword);

module.exports = router;

