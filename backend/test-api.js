/**
 * API Testing Script
 * Run with: node test-api.js
 */

const API_URL = 'http://localhost:3000/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testHealthCheck() {
  log('\n=== Testing Health Check ===', 'blue');
  try {
    const response = await fetch(`${API_URL}/health`);
    
    if (!response.ok) {
      log(`✗ Health check failed with status: ${response.status}`, 'red');
      const text = await response.text();
      log(`  Response: ${text}`, 'yellow');
      return false;
    }
    
    const text = await response.text();
    if (!text) {
      log('✗ Health check returned empty response', 'red');
      return false;
    }
    
    const data = JSON.parse(text);
    if (data.status === 'OK') {
      log('✓ Health check passed', 'green');
      return true;
    } else {
      log('✗ Health check failed', 'red');
      return false;
    }
  } catch (error) {
    if (error.message.includes('fetch failed') || error.code === 'ECONNREFUSED') {
      log('✗ Cannot connect to server. Is it running?', 'red');
      log('  Make sure to run: npm run dev', 'yellow');
    } else if (error.message.includes('JSON')) {
      log('✗ Invalid JSON response from server', 'red');
      log(`  Error: ${error.message}`, 'yellow');
    } else {
      log(`✗ Health check error: ${error.message}`, 'red');
    }
    return false;
  }
}

async function testSignup() {
  log('\n=== Testing Sign Up ===', 'blue');
  const testUser = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'TestPass123!',
  };

  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });

    const data = await response.json();

    if (data.success) {
      log('✓ Sign up successful', 'green');
      log(`  User ID: ${data.user.id}`, 'yellow');
      log(`  Username: ${data.user.username}`, 'yellow');
      log(`  Email: ${data.user.email}`, 'yellow');
      log(`  Token: ${data.token.substring(0, 20)}...`, 'yellow');
      return { success: true, user: testUser, token: data.token };
    } else {
      log(`✗ Sign up failed: ${data.error}`, 'red');
      return { success: false };
    }
  } catch (error) {
    log(`✗ Sign up error: ${error.message}`, 'red');
    return { success: false };
  }
}

async function testLogin(email, password) {
  log('\n=== Testing Login ===', 'blue');
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      log('✓ Login successful', 'green');
      log(`  User ID: ${data.user.id}`, 'yellow');
      log(`  Username: ${data.user.username}`, 'yellow');
      log(`  Token: ${data.token.substring(0, 20)}...`, 'yellow');
      return { success: true, token: data.token };
    } else {
      log(`✗ Login failed: ${data.error}`, 'red');
      return { success: false };
    }
  } catch (error) {
    log(`✗ Login error: ${error.message}`, 'red');
    return { success: false };
  }
}

async function testInvalidLogin() {
  log('\n=== Testing Invalid Login ===', 'blue');
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'WrongPassword123!',
      }),
    });

    const data = await response.json();

    if (!data.success && data.error) {
      log('✓ Invalid login correctly rejected', 'green');
      log(`  Error: ${data.error}`, 'yellow');
      return true;
    } else {
      log('✗ Invalid login was accepted (should have failed)', 'red');
      return false;
    }
  } catch (error) {
    log(`✗ Test error: ${error.message}`, 'red');
    return false;
  }
}

async function testDuplicateSignup(email) {
  log('\n=== Testing Duplicate Sign Up ===', 'blue');
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `duplicate_${Date.now()}`,
        email: email,
        password: 'TestPass123!',
      }),
    });

    const data = await response.json();

    if (!data.success && data.error) {
      log('✓ Duplicate signup correctly rejected', 'green');
      log(`  Error: ${data.error}`, 'yellow');
      return true;
    } else {
      log('✗ Duplicate signup was accepted (should have failed)', 'red');
      return false;
    }
  } catch (error) {
    log(`✗ Test error: ${error.message}`, 'red');
    return false;
  }
}

async function testOAuth() {
  log('\n=== Testing OAuth Login ===', 'blue');
  try {
    const response = await fetch(`${API_URL}/auth/oauth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `oauth_${Date.now()}@example.com`,
        username: 'OAuth Test User',
        provider: 'google',
        providerId: `google_${Date.now()}`,
      }),
    });

    const data = await response.json();

    if (data.success) {
      log('✓ OAuth login successful', 'green');
      log(`  User ID: ${data.user.id}`, 'yellow');
      log(`  Provider: ${data.user.provider}`, 'yellow');
      log(`  Token: ${data.token.substring(0, 20)}...`, 'yellow');
      return true;
    } else {
      log(`✗ OAuth login failed: ${data.error}`, 'red');
      return false;
    }
  } catch (error) {
    log(`✗ OAuth error: ${error.message}`, 'red');
    return false;
  }
}

async function runAllTests() {
  log('\n🚀 Starting API Tests...', 'blue');
  log('Make sure the server is running on http://localhost:3000', 'yellow');

  const results = {
    healthCheck: false,
    signup: false,
    login: false,
    invalidLogin: false,
    duplicateSignup: false,
    oauth: false,
  };

  // Test 1: Health Check
  results.healthCheck = await testHealthCheck();
  if (!results.healthCheck) {
    log('\n❌ Server is not running. Please start the server first.', 'red');
    process.exit(1);
  }

  // Test 2: Sign Up
  const signupResult = await testSignup();
  results.signup = signupResult.success;
  const testUser = signupResult.user;

  // Test 3: Login with correct credentials
  if (results.signup && testUser) {
    results.login = (await testLogin(testUser.email, testUser.password)).success;
  }

  // Test 4: Invalid Login
  results.invalidLogin = await testInvalidLogin();

  // Test 5: Duplicate Signup
  if (results.signup && testUser) {
    results.duplicateSignup = await testDuplicateSignup(testUser.email);
  }

  // Test 6: OAuth
  results.oauth = await testOAuth();

  // Summary
  log('\n=== Test Summary ===', 'blue');
  log(`Health Check: ${results.healthCheck ? '✓' : '✗'}`, results.healthCheck ? 'green' : 'red');
  log(`Sign Up: ${results.signup ? '✓' : '✗'}`, results.signup ? 'green' : 'red');
  log(`Login: ${results.login ? '✓' : '✗'}`, results.login ? 'green' : 'red');
  log(`Invalid Login: ${results.invalidLogin ? '✓' : '✗'}`, results.invalidLogin ? 'green' : 'red');
  log(`Duplicate Signup: ${results.duplicateSignup ? '✓' : '✗'}`, results.duplicateSignup ? 'green' : 'red');
  log(`OAuth: ${results.oauth ? '✓' : '✗'}`, results.oauth ? 'green' : 'red');

  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;

  log(`\n${passed}/${total} tests passed`, passed === total ? 'green' : 'yellow');

  if (passed === total) {
    log('\n🎉 All tests passed!', 'green');
  } else {
    log('\n⚠️  Some tests failed. Check the output above.', 'yellow');
  }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('Error: This script requires Node.js 18+ or install node-fetch');
  process.exit(1);
}

// Run tests
runAllTests().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});

