# Google & Apple Sign-In Setup Guide

## Google Sign-In Setup

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application" as the application type
   - Add authorized redirect URIs:
     - `https://auth.expo.io/@your-username/idj-app`
     - `exp://localhost:8081` (for development)
   - Copy the **Client ID**

### Step 2: Update Your Code

In `src/context/AuthContext.js`, replace:
```javascript
const clientId = 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com';
```

With your actual Google Client ID:
```javascript
const clientId = '123456789-abcdefghijklmnop.apps.googleusercontent.com';
```

## Apple Sign-In Setup

### Step 1: Enable Apple Sign-In in Apple Developer

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to "Certificates, Identifiers & Profiles"
3. Select your App ID
4. Enable "Sign In with Apple" capability
5. Save the changes

### Step 2: Configure in Expo

The `app.json` file already has `usesAppleSignIn: true` configured for iOS.

### Step 3: Build Development Client

**Important**: Apple Sign-In requires a development build (doesn't work in Expo Go).

To create a development build:
```bash
npx expo prebuild
npx expo run:ios
```

Or use EAS Build:
```bash
eas build --profile development --platform ios
```

## Testing

### Google Sign-In
- Works in Expo Go (with web OAuth flow)
- Requires valid Google Client ID
- Will open browser for authentication

### Apple Sign-In
- **Only works on iOS devices/simulator**
- Requires development build (not Expo Go)
- Uses native Apple authentication

## Backend Integration

After getting OAuth tokens, you'll need to:

1. **Google**: Exchange the authorization code for access token and user info
2. **Apple**: Verify the identity token with Apple's servers
3. Create/update user in your Supabase database
4. Return JWT token to the app

Update the `loginWithGoogle` and `loginWithApple` functions in `AuthContext.js` to call your backend API instead of using mock data.

## Notes

- Google Sign-In works in Expo Go using web OAuth
- Apple Sign-In requires a development build
- Both methods currently use mock data - replace with actual backend calls
- Make sure to handle token refresh and user session management

