import React, { createContext, useState, useContext } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { API_URL } from '../config/api';
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_DISCOVERY } from '../config/googleAuth';

// Complete web browser authentication for Google OAuth
WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(null);

  const login = async (emailOrPhone, password) => {
    setIsLoading(true);
    try {
      console.log('🔐 [LOGIN] Attempting login to:', API_URL);
      
      // Determine if input is email or phone
      const isEmail = emailOrPhone.includes('@');
      const requestBody = isEmail 
        ? { email: emailOrPhone, password }
        : { phone: emailOrPhone, password };
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        setIsLoading(false);
        console.log('✅ [LOGIN] Login successful');
        return { success: true, user: data.user };
      } else {
        setIsLoading(false);
        console.log('❌ [LOGIN] Login failed:', data.error);
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      setIsLoading(false);
      console.error('❌ [LOGIN] Network error:', error.message);
      let errorMessage = 'Network error. Please check your connection.';
      
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Make sure:\n1. Backend server is running\n2. Both devices are on the same Wi-Fi network\n3. Firewall allows connections';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (emailOrPhone, password, username) => {
    setIsLoading(true);
    try {
      console.log('📝 [SIGNUP] Attempting signup to:', API_URL);
      
      // Determine if input is email or phone
      const isEmail = emailOrPhone.includes('@');
      const requestBody = isEmail
        ? { email: emailOrPhone, password, username }
        : { phone: emailOrPhone, password, username };
      
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        setIsLoading(false);
        console.log('✅ [SIGNUP] Signup successful');
        return { success: true, user: data.user };
      } else {
        setIsLoading(false);
        console.log('❌ [SIGNUP] Signup failed:', data.error);
        return { success: false, error: data.error || 'Sign up failed' };
      }
    } catch (error) {
      setIsLoading(false);
      console.error('❌ [SIGNUP] Network error:', error.message);
      let errorMessage = 'Network error. Please check your connection.';
      
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Make sure:\n1. Backend server is running\n2. Both devices are on the same Wi-Fi network\n3. Firewall allows connections';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      // Check if Google Client ID is configured
      if (GOOGLE_WEB_CLIENT_ID.includes('YOUR_GOOGLE_WEB_CLIENT_ID')) {
        setIsLoading(false);
        return { 
          success: false, 
          error: 'Google Sign-In is not configured. Please set up your Google OAuth Client ID in src/config/googleAuth.js' 
        };
      }

      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'idj-app',
        useProxy: true,
      });

      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_WEB_CLIENT_ID,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.Code,
        redirectUri: redirectUri,
        usePKCE: true,
      });

      const result = await request.promptAsync(GOOGLE_DISCOVERY);

      if (result.type === 'success') {
        // Exchange authorization code for access token
        try {
          const tokenResponse = await fetch(GOOGLE_DISCOVERY.tokenEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              code: result.params.code,
              client_id: GOOGLE_WEB_CLIENT_ID,
              redirect_uri: redirectUri,
              grant_type: 'authorization_code',
            }).toString(),
          });

          if (!tokenResponse.ok) {
            throw new Error('Failed to exchange authorization code for token');
          }

          const tokenData = await tokenResponse.json();
          const accessToken = tokenData.access_token;

          // Fetch user info from Google
          const userInfoResponse = await fetch(GOOGLE_DISCOVERY.userInfoEndpoint, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!userInfoResponse.ok) {
            throw new Error('Failed to fetch user info from Google');
          }

          const userInfo = await userInfoResponse.json();

          // Send user info to backend
          const response = await fetch(`${API_URL}/auth/oauth`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: userInfo.email,
              username: userInfo.name || userInfo.given_name || userInfo.email.split('@')[0],
              provider: 'google',
              providerId: userInfo.id,
            }),
          });

          const data = await response.json();

          if (data.success) {
            setUser(data.user);
            setToken(data.token);
            setIsLoading(false);
            console.log('✅ [GOOGLE LOGIN] Login successful');
            return { success: true, user: data.user };
          } else {
            setIsLoading(false);
            console.log('❌ [GOOGLE LOGIN] Login failed:', data.error);
            return { success: false, error: data.error || 'Google sign-in failed' };
          }
        } catch (error) {
          setIsLoading(false);
          console.error('❌ [GOOGLE LOGIN] Error:', error.message);
          return { success: false, error: error.message || 'Failed to complete Google sign-in' };
        }
      } else {
        setIsLoading(false);
        return { success: false, error: 'Google sign-in was cancelled' };
      }
    } catch (error) {
      setIsLoading(false);
      console.error('❌ [GOOGLE LOGIN] Error:', error);
      return { success: false, error: error.message || 'Failed to sign in with Google' };
    }
  };

  const loginWithApple = async () => {
    if (Platform.OS !== 'ios') {
      return { success: false, error: 'Apple Sign In is only available on iOS' };
    }

    setIsLoading(true);
    try {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        setIsLoading(false);
        return {
          success: false,
          error:
            'Apple Sign In is not available in Expo Go. Build a dev client with "npx expo run:ios" or an EAS development build to test.',
        };
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Send credential to backend for verification
      try {
        const response = await fetch(`${API_URL}/auth/oauth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: credential.email || `apple_${credential.user}@privaterelay.appleid.com`,
            username: credential.fullName?.givenName || credential.fullName?.familyName || 'Apple User',
            provider: 'apple',
            providerId: credential.user,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setUser(data.user);
          setToken(data.token);
          setIsLoading(false);
          return { success: true, user: data.user };
        } else {
          setIsLoading(false);
          return { success: false, error: data.error || 'Apple sign-in failed' };
        }
      } catch (error) {
        setIsLoading(false);
        return { success: false, error: error.message || 'Failed to complete Apple sign-in' };
      }
    } catch (error) {
      setIsLoading(false);
      if (error.code === 'ERR_CANCELED') {
        return { success: false, error: 'Apple sign-in was cancelled' };
      }
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        loginWithApple,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

