import React, { createContext, useState, useContext } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

// Complete web browser authentication for Google OAuth
WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call to your backend
      // For now, this is a mock implementation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Mock user data
      const mockUser = {
        id: '1',
        email: email,
        username: email.split('@')[0],
      };
      
      setUser(mockUser);
      setIsLoading(false);
      return { success: true, user: mockUser };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: error.message };
    }
  };

  const signup = async (email, password, username) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call to your backend
      // For now, this is a mock implementation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Mock user data
      const mockUser = {
        id: '1',
        email: email,
        username: username,
      };
      
      setUser(mockUser);
      setIsLoading(false);
      return { success: true, user: mockUser };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: error.message };
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
        // TODO: Exchange authorization code for tokens and user info with your backend
        // For now, using mock data
        const mockUser = {
          id: 'google_' + Date.now(),
          email: 'user@gmail.com',
          username: 'Google User',
          provider: 'google',
        };
        
        setUser(mockUser);
        setIsLoading(false);
        return { success: true, user: mockUser };
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

      // TODO: Send credential to your backend for verification
      // For now, using mock data
      const mockUser = {
        id: credential.user,
        email: credential.email || 'apple@privaterelay.appleid.com',
        username: credential.fullName?.givenName || 'Apple User',
        provider: 'apple',
      };

      setUser(mockUser);
      setIsLoading(false);
      return { success: true, user: mockUser };
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

