const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  oauthLogin,
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

module.exports = router;

