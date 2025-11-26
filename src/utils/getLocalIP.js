// Helper to get local IP address
// This can be used to automatically detect the IP in the future
export const getLocalIP = () => {
  // For now, return the hardcoded IP
  // In the future, this could use a library or network detection
  return '10.0.1.172';
};

// Instructions to find your IP:
// macOS: ipconfig getifaddr en0
// Windows: ipconfig | findstr IPv4
// Linux: hostname -I | awk '{print $1}'

