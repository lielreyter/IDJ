# Testing Guide - Login Endpoints & MongoDB Integration

This guide will help you test the authentication endpoints and verify MongoDB integration.

## Prerequisites

1. MongoDB Atlas cluster configured (or local MongoDB instance)
2. Backend dependencies installed (`npm install` in `backend/` folder)
3. Environment variables configured (`.env` file)

## Step 1: Configure MongoDB Connection

1. **Get your MongoDB connection string:**
   - If using MongoDB Atlas: Go to your cluster → Connect → Connect your application
   - Copy the connection string (format: `mongodb+srv://username:password@cluster.mongodb.net/...`)

2. **Create `.env` file in the `backend/` directory:**
   ```bash
   cd backend
   cp .env.example .env
   ```

3. **Edit `.env` file:**
   ```env
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/idj-db?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
   PORT=3000
   ```

   **Important:** Replace:
   - `your-username` with your MongoDB username
   - `your-password` with your MongoDB password
   - `cluster.mongodb.net` with your actual cluster URL
   - `idj-db` with your preferred database name

## Step 2: Start the Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
MongoDB Connected: cluster0.xxxxx.mongodb.net
Server running on port 3000
```

If you see connection errors, check:
- MongoDB connection string is correct
- MongoDB Atlas IP whitelist includes `0.0.0.0/0` (for testing) or your IP
- Username and password are correct

## Step 3: Test the Endpoints

### Option A: Using cURL (Command Line)

#### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

#### 2. Sign Up (Create Account)

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

**Expected Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "username": "testuser",
    "email": "test@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Expected Response (Error - Email exists):**
```json
{
  "success": false,
  "error": "Email already registered"
}
```

#### 3. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

**Expected Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "username": "testuser",
    "email": "test@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Expected Response (Error - Wrong password):**
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

#### 4. OAuth Login (Google/Apple)

```bash
curl -X POST http://localhost:3000/api/auth/oauth \
  -H "Content-Type: application/json" \
  -d '{
    "email": "oauth@example.com",
    "username": "OAuth User",
    "provider": "google",
    "providerId": "google_123456789"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "username": "OAuth User",
    "email": "oauth@example.com",
    "provider": "google"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Option B: Using Postman

1. **Import Collection:**
   - Create a new collection called "IDJ API"
   - Add the following requests:

2. **Health Check:**
   - Method: `GET`
   - URL: `http://localhost:3000/api/health`

3. **Sign Up:**
   - Method: `POST`
   - URL: `http://localhost:3000/api/auth/signup`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "username": "testuser",
       "email": "test@example.com",
       "password": "TestPass123!"
     }
     ```

4. **Login:**
   - Method: `POST`
   - URL: `http://localhost:3000/api/auth/login`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "email": "test@example.com",
       "password": "TestPass123!"
     }
     ```

### Option C: Using JavaScript/Node.js

Create a test file `backend/test-api.js`:

```javascript
const API_URL = 'http://localhost:3000/api';

async function testAPI() {
  try {
    // Test Sign Up
    console.log('Testing Sign Up...');
    const signupResponse = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser',
        email: 'test@example.com',
        password: 'TestPass123!'
      })
    });
    const signupData = await signupResponse.json();
    console.log('Sign Up Result:', signupData);

    // Test Login
    console.log('\nTesting Login...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPass123!'
      })
    });
    const loginData = await loginResponse.json();
    console.log('Login Result:', loginData);

    // Test Invalid Login
    console.log('\nTesting Invalid Login...');
    const invalidLoginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'WrongPassword123!'
      })
    });
    const invalidLoginData = await invalidLoginResponse.json();
    console.log('Invalid Login Result:', invalidLoginData);

  } catch (error) {
    console.error('Test Error:', error);
  }
}

testAPI();
```

Run with:
```bash
node backend/test-api.js
```

## Step 4: Verify MongoDB Integration

### Check Database Connection

1. **In MongoDB Atlas:**
   - Go to your cluster
   - Click "Browse Collections"
   - You should see a database named `idj-db` (or your chosen name)
   - Inside, you should see a `users` collection

2. **Verify User Creation:**
   - After successful signup, check the `users` collection
   - You should see a document with:
     - `username`
     - `email`
     - `password` (hashed, not plain text)
     - `provider` (should be "local" for email/password)
     - `createdAt`

### Example User Document in MongoDB:

```json
{
  "_id": ObjectId("65a1b2c3d4e5f6g7h8i9j0k1"),
  "username": "testuser",
  "email": "test@example.com",
  "password": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
  "provider": "local",
  "createdAt": ISODate("2024-01-15T10:30:00.000Z"),
  "__v": 0
}
```

**Note:** The password should be hashed (starting with `$2a$` or `$2b$`), never plain text.

## Step 5: Test Password Validation

### Test Weak Passwords

```bash
# Missing uppercase
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username": "user1", "email": "user1@test.com", "password": "test123!"}'

# Missing number
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username": "user2", "email": "user2@test.com", "password": "TestPass!"}'

# Missing special character
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username": "user3", "email": "user3@test.com", "password": "TestPass123"}'
```

All should return validation errors (handled by frontend, but backend should also validate).

## Step 6: Test Error Cases

### 1. Duplicate Email
```bash
# First signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username": "user1", "email": "duplicate@test.com", "password": "TestPass123!"}'

# Try to signup again with same email
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username": "user2", "email": "duplicate@test.com", "password": "TestPass123!"}'
```

Expected: `"Email already registered"`

### 2. Duplicate Username
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username": "duplicateuser", "email": "test1@test.com", "password": "TestPass123!"}'

curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username": "duplicateuser", "email": "test2@test.com", "password": "TestPass123!"}'
```

Expected: `"Username already taken"`

### 3. Invalid Email Format
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username": "user", "email": "invalid-email", "password": "TestPass123!"}'
```

Expected: Validation error (handled by Mongoose schema)

### 4. Wrong Password on Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "WrongPassword123!"}'
```

Expected: `"Invalid email or password"`

## Troubleshooting

### MongoDB Connection Issues

**Error: "MongoServerError: bad auth"**
- Check username and password in connection string
- Verify MongoDB user has proper permissions

**Error: "MongoServerError: IP not whitelisted"**
- Add your IP address to MongoDB Atlas Network Access
- For testing, you can temporarily add `0.0.0.0/0` (allows all IPs)

**Error: "MongooseServerSelectionError"**
- Check internet connection
- Verify cluster is running in MongoDB Atlas
- Check connection string format

### Server Issues

**Error: "Port 3000 already in use"**
- Change PORT in `.env` file
- Or kill the process using port 3000:
  ```bash
  # macOS/Linux
  lsof -ti:3000 | xargs kill -9
  ```

**Error: "Cannot find module"**
- Run `npm install` in the `backend/` directory
- Check that all dependencies are installed

### API Issues

**Error: "Network error" or "Connection refused"**
- Verify server is running (`npm run dev`)
- Check API URL in `src/config/api.js`
- For physical device testing, use your computer's IP instead of `localhost`

**Error: "CORS error"**
- CORS is already enabled in the server
- If issues persist, check `backend/src/server.js` CORS configuration

## Testing Checklist

- [ ] MongoDB connection successful
- [ ] Server starts without errors
- [ ] Health check endpoint works
- [ ] Sign up creates user in MongoDB
- [ ] Password is hashed in database
- [ ] Login with correct credentials works
- [ ] Login with wrong password fails
- [ ] Duplicate email signup fails
- [ ] Duplicate username signup fails
- [ ] OAuth endpoint works
- [ ] JWT token is returned
- [ ] Error messages are clear

## Next Steps

After verifying all endpoints work:

1. Update `src/config/api.js` in the React Native app with your server URL
2. Test login/signup from the mobile app
3. Verify tokens are stored and used for authenticated requests
4. Set up production MongoDB cluster
5. Deploy backend to production (Heroku, AWS, etc.)

## Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [JWT.io](https://jwt.io/) - For decoding and testing JWT tokens

