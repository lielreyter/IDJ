# Troubleshooting Server Issues

## Server Crashes on Startup

### Issue: "MONGODB_URI is not defined"

**Solution:**
1. Make sure you have a `.env` file in the `backend/` directory
2. Copy from example: `cp .env.example .env`
3. Add your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/idj-db?retryWrites=true&w=majority
   JWT_SECRET=your-secret-key-here
   PORT=5000
   ```

### Issue: "MongoDB Connection Error"

**Common causes:**

1. **Invalid connection string**
   - Check username and password are correct
   - Verify the connection string format
   - Make sure there are no extra spaces

2. **IP not whitelisted (MongoDB Atlas)**
   - Go to MongoDB Atlas → Network Access
   - Add your IP address or `0.0.0.0/0` for testing
   - Wait a few minutes for changes to propagate

3. **Wrong database user**
   - Verify the username exists in MongoDB Atlas
   - Check the user has proper permissions

4. **Cluster not running**
   - Check MongoDB Atlas dashboard
   - Ensure cluster is not paused

### Issue: "Port 5000 already in use"

**Solution:**
```bash
# Find and kill the process
# macOS/Linux:
lsof -ti:5000 | xargs kill -9

# Or change PORT in .env file
PORT=5001
```

### Issue: "Cannot find module"

**Solution:**
```bash
cd backend
npm install
```

## Test Script Issues

### Issue: "Unexpected end of JSON input"

This means the server isn't running or isn't responding properly.

**Solution:**
1. Make sure the server is running:
   ```bash
   cd backend
   npm run dev
   ```
2. Wait for "Server running on port 5000" message
3. Then run tests in another terminal:
   ```bash
   npm test
   ```

### Issue: "ECONNREFUSED"

The server isn't running or is on a different port.

**Solution:**
1. Check if server is running: `lsof -i :5000`
2. Start the server: `npm run dev`
3. Verify the port matches in `test-api.js` (default: 5000)

## Quick Debugging Steps

1. **Check .env file exists:**
   ```bash
   ls -la backend/.env
   ```

2. **Verify environment variables are loaded:**
   ```bash
   cd backend
   node -e "require('dotenv').config(); console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Missing')"
   ```

3. **Test MongoDB connection directly:**
   ```bash
   # Install mongosh if needed
   mongosh "your-connection-string-here"
   ```

4. **Check server logs:**
   - Look for "MongoDB Connected" message
   - Look for "Server running on port X" message
   - Check for any error messages

5. **Test health endpoint manually:**
   ```bash
   curl http://localhost:5000/api/health
   ```

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `MONGODB_URI is not defined` | Missing .env file or variable | Create .env file with MONGODB_URI |
| `bad auth` | Wrong username/password | Check MongoDB credentials |
| `IP not whitelisted` | Your IP not in MongoDB whitelist | Add IP to MongoDB Atlas Network Access |
| `ECONNREFUSED` | Server not running | Start server with `npm run dev` |
| `Port already in use` | Another process using port 5000 | Kill process or change PORT |
| `Cannot find module` | Dependencies not installed | Run `npm install` |

## Still Having Issues?

1. Check the server terminal for detailed error messages
2. Verify MongoDB Atlas cluster is active
3. Test with a simple connection string first
4. Check Node.js version: `node --version` (should be 14+)
5. Try restarting the server

