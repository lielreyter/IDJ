// Google OAuth Configuration
// Get your Google OAuth Client ID from: https://console.cloud.google.com/
// 
// Setup instructions:
// 1. Go to Google Cloud Console
// 2. Create a new project or select existing one
// 3. Enable Google+ API
// 4. Go to "APIs & Services" > "Credentials"
// 5. Create OAuth 2.0 Client ID (Web application type)
// 6. Add authorized redirect URIs:
//    - https://auth.expo.io/@your-username/idj-app
//    - exp://localhost:8081
// 7. Copy the Client ID and paste it below

// TODO: Replace with your actual Google OAuth Web Client ID
export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com';

// Google OAuth endpoints
export const GOOGLE_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
  userInfoEndpoint: 'https://www.googleapis.com/oauth2/v2/userinfo',
};

