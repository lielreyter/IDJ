# IDJ - TikTok Style Video App

A React Native app with TikTok-style vertical video scrolling functionality.

## Features

- ✅ Vertical video feed with smooth scrolling
- ✅ Auto-play videos when in view
- ✅ Pause videos when scrolled away
- ✅ TikTok-style UI with like, comment, and share buttons
- ✅ User information overlay on videos

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the Expo development server:**
   ```bash
   npm start
   ```

3. **Run on your device:**
   - Scan the QR code with Expo Go app (iOS/Android)
   - Or press `i` for iOS simulator
   - Or press `a` for Android emulator

## Project Structure

```
IDJ/
├── App.js                 # Main app entry point
├── src/
│   └── components/
│       ├── VideoFeed.js   # Main feed component with FlatList
│       └── VideoItem.js   # Individual video item component
├── package.json
└── app.json
```

## Customization

### Adding Your Own Videos

Edit `src/components/VideoFeed.js` and replace the `SAMPLE_VIDEOS` array with your video URLs:

```javascript
const SAMPLE_VIDEOS = [
  {
    id: '1',
    uri: 'YOUR_VIDEO_URL_HERE',
    user: '@yourusername',
    description: 'Your video description',
  },
  // Add more videos...
];
```

### Video Sources

The app currently uses sample videos from Google's test bucket. Replace these with:
- URLs from your AWS S3 bucket (as per your plan)
- Local video files
- Any HTTP/HTTPS video URL

## Next Steps

Based on your plan:
1. ✅ Step 1: User interface (React Native) - **COMPLETED**
2. ⏳ Step 2: AWS + S3 integration
3. ⏳ Step 3: Backend with Node.js + Supabase
4. ⏳ Step 4: Domain and app store publishing
5. ⏳ Step 5: Marketing
6. ⏳ Step 6: Profit! 💰

## Dependencies

- `expo`: ~54.0.0 (Expo SDK 54)
- `expo-av`: ~16.0.7 (Video playback)
- `react`: 19.1.0
- `react-native`: 0.81.5

## Notes

- Videos auto-play when they come into view
- Videos pause when scrolled away
- Each video takes full screen height
- Smooth scrolling with snap-to-page behavior

