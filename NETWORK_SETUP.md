# Network Setup Guide

## Current Configuration

- **API URL for Mobile Devices:** `http://10.0.1.172:3000/api`
- **API URL for Web/Simulator:** `http://localhost:3000/api`

## If Network Request Fails

### 1. Check Your IP Address

Your IP address may change when you:
- Connect to a different Wi-Fi network
- Restart your router
- Change network settings

**Find your current IP:**
```bash
# macOS
ipconfig getifaddr en0

# Windows
ipconfig | findstr IPv4

# Linux
hostname -I | awk '{print $1}'
```

### 2. Update API Configuration

Edit `src/config/api.js` and update the `LOCAL_IP` constant:

```javascript
const LOCAL_IP = 'YOUR_NEW_IP_HERE'; // e.g., '192.168.1.100'
```

### 3. Verify Backend is Running

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB Connected: ...
✅ Server running on port 3000
```

### 4. Test Connection

Test if your backend is accessible:
```bash
curl http://YOUR_IP:3000/api/health
```

Should return: `{"status":"OK","message":"Server is running"}`

### 5. Check Network Requirements

- ✅ Backend server is running
- ✅ Phone and computer on same Wi-Fi network
- ✅ Firewall allows connections on port 3000
- ✅ IP address is correct in `src/config/api.js`

## Troubleshooting

### "Network request failed" Error

1. **Verify IP address is correct:**
   - Check `src/config/api.js` has the right IP
   - Make sure it matches your computer's current IP

2. **Check backend is running:**
   - Look for "Server running on port 3000" message
   - Test with: `curl http://YOUR_IP:3000/api/health`

3. **Check network:**
   - Both devices must be on the same Wi-Fi
   - Try disconnecting and reconnecting to Wi-Fi

4. **Check firewall:**
   - macOS: System Settings → Network → Firewall
   - Allow Node.js or temporarily disable firewall to test

5. **Restart Expo:**
   - Press `r` in Expo terminal to reload
   - Or restart Expo completely

### IP Address Changed?

If your IP address changes, update `src/config/api.js`:
```javascript
const LOCAL_IP = 'NEW_IP_ADDRESS';
```

Then reload the app in Expo Go.

## Current Setup

- **Your IP:** `10.0.1.172`
- **Backend Port:** `3000`
- **API URL:** `http://10.0.1.172:3000/api`

