import React, { createContext, useState, useContext } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { API_URL } from '../config/api';

// Complete web browser authentication for Google OAuth
WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(null);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        setIsLoading(false);
        return { success: true, user: data.user };
      } else {
        setIsLoading(false);
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: error.message || 'Network error. Please check your connection.' };
    }
  };

  const signup = async (email, password, username) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        setIsLoading(false);
        return { success: true, user: data.user };
      } else {
        setIsLoading(false);
        return { success: false, error: data.error || 'Sign up failed' };
      }
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: error.message || 'Network error. Please check your connection.' };
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      // Google OAuth configuration
      // TODO: Replace with your actual Google OAuth client ID
      // Get this from: https://console.cloud.google.com/
      // For web client ID (works with Expo Go)
      const clientId = 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com';
      
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'idj-app',
        useProxy: true,
      });

      const discovery = {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
        revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
      };

      const request = new AuthSession.AuthRequest({
        clientId: clientId,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.Code,
        redirectUri: redirectUri,
        usePKCE: true,
      });

      const result = await request.promptAsync(discovery);

      if (result.type === 'success') {
        // Exchange authorization code for user info
        // Note: In production, you should exchange the code on your backend
        // For now, we'll send the code to your backend to handle
        try {
          const response = await fetch(`${API_URL}/auth/oauth`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: 'user@gmail.com', // Replace with actual email from Google
              username: 'Google User',
              provider: 'google',
              providerId: result.params.code,
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
            return { success: false, error: data.error || 'Google sign-in failed' };
          }
        } catch (error) {
          setIsLoading(false);
          return { success: false, error: error.message || 'Failed to complete Google sign-in' };
        }
      } else {
        setIsLoading(false);
        return { success: false, error: 'Google sign-in was cancelled' };
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Google login error:', error);
      return { success: false, error: error.message || 'Failed to sign in with Google' };
    }
  };

  const loginWithApple = async () => {
    if (Platform.OS !== 'ios') {
      return { success: false, error: 'Apple Sign In is only available on iOS' };
    }

    setIsLoading(true);
    try {
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

