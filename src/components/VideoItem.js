import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Video } from 'expo-av';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const VideoItem = ({ video, isActive, index }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      videoRef.current?.playAsync().catch((error) => {
        console.log('Error playing video:', error);
      });
    } else {
      videoRef.current?.pauseAsync().catch((error) => {
        console.log('Error pausing video:', error);
      });
    }
  }, [isActive]);

  const handleLike = () => {
    // TODO: Implement like functionality
    console.log('Liked video:', video.id);
  };

  const handleComment = () => {
    // TODO: Implement comment functionality
    console.log('Comment on video:', video.id);
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share video:', video.id);
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: video.uri }}
        style={styles.video}
        resizeMode="cover"
        shouldPlay={isActive}
        isLooping
        isMuted={false}
        volume={1.0}
      />
      
      {/* Video Overlay UI */}
      <View style={styles.overlay}>
        {/* Right Side Actions */}
        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <View style={styles.actionIcon}>
              <Text style={styles.actionEmoji}>❤️</Text>
            </View>
            <Text style={styles.actionText}>24.5K</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
            <View style={styles.actionIcon}>
              <Text style={styles.actionEmoji}>💬</Text>
            </View>
            <Text style={styles.actionText}>1.2K</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <View style={styles.actionIcon}>
              <Text style={styles.actionEmoji}>↗️</Text>
            </View>
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom User Info */}
        <View style={styles.bottomInfo}>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{video.user}</Text>
            <Text style={styles.description}>{video.description}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    justifyContent: 'space-between',
  },
  rightActions: {
    position: 'absolute',
    right: 15,
    bottom: 100,
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 25,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomInfo: {
    padding: 15,
    paddingBottom: 30,
  },
  userInfo: {
    maxWidth: SCREEN_WIDTH - 100,
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: {
    color: '#fff',
    fontSize: 14,
  },
});

export default VideoItem;

