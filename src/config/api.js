// API Configuration
// For local development, use your computer's IP address
// For production, use your deployed backend URL
import { Platform } from 'react-native';

// Your computer's local IP address (update if it changes)
// Find it with: ipconfig getifaddr en0 (macOS) or ipconfig (Windows)
const LOCAL_IP = '10.0.1.172';
const PORT = '3000';

export const API_URL = __DEV__
  ? Platform.OS === 'web' 
    ? `http://localhost:${PORT}/api` // Use localhost for web
    : `http://${LOCAL_IP}:${PORT}/api` // Use IP address for mobile devices
  : 'https://your-production-api.com/api'; // Replace with your production URL

