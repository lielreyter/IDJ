// API Configuration
// For local development, use your computer's IP address
// For production, use your deployed backend URL
export const API_URL = __DEV__
  ? 'http://localhost:3000/api' // Change localhost to your computer's IP for physical device testing
  : 'https://your-production-api.com/api'; // Replace with your production URL

