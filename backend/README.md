# IDJ Backend API

Backend server for IDJ app using Express.js and MongoDB with Mongoose.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update `MONGODB_URI` with your MongoDB Atlas connection string
   - Set a strong `JWT_SECRET` for token generation
   - Optionally set `PORT` (defaults to 5000)

3. **Start the server:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

#### POST `/api/auth/signup`
Register a new user.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "token": "jwt_token_here"
}
```

#### POST `/api/auth/login`
Login existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "token": "jwt_token_here"
}
```

#### POST `/api/auth/oauth`
OAuth login/signup (Google/Apple).

**Request Body:**
```json
{
  "email": "user@gmail.com",
  "username": "Google User",
  "provider": "google",
  "providerId": "google_user_id"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "username": "Google User",
    "email": "user@gmail.com",
    "provider": "google"
  },
  "token": "jwt_token_here"
}
```

#### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## MongoDB Connection

Make sure your MongoDB connection string is in the format:
```
mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority
```

## Environment Variables

- `MONGODB_URI` - MongoDB connection string (required)
- `JWT_SECRET` - Secret key for JWT token generation (required)
- `PORT` - Server port (optional, defaults to 5000)

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js      # MongoDB connection
│   ├── controllers/
│   │   └── authController.js # Authentication logic
│   ├── models/
│   │   └── User.js          # User model
│   ├── routes/
│   │   └── authRoutes.js    # Authentication routes
│   └── server.js            # Express server setup
├── .env                     # Environment variables (not in git)
├── .env.example            # Example environment variables
├── package.json
└── README.md
```

