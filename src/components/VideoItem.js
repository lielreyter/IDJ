import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Video } from 'expo-av';
import { API_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const VideoItem = ({ video, isActive, index, onLikeUpdate }) => {
  const videoRef = useRef(null);
  const [isLiked, setIsLiked] = useState(video.isLiked || false);
  const [likeCount, setLikeCount] = useState(video.likeCount || 0);
  const { token } = useAuth();

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

  useEffect(() => {
    setIsLiked(video.isLiked || false);
    setLikeCount(video.likeCount || 0);
  }, [video.isLiked, video.likeCount]);

  const formatCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const handleLike = async () => {
    if (!token) {
      Alert.alert('Login Required', 'Please log in to like videos');
      return;
    }

    const prevLiked = isLiked;
    const prevCount = likeCount;
    // optimistic update
    const nextLiked = !isLiked;
    const nextCount = nextLiked ? likeCount + 1 : Math.max(0, likeCount - 1);
    setIsLiked(nextLiked);
    setLikeCount(nextCount);

    try {
      const response = await fetch(`${API_URL}/videos/${video.videoId || video.id}/like`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to like video');
      }

      const data = await response.json();

      if (data.success) {
        setIsLiked(data.isLiked);
        setLikeCount(data.likeCount);

        // Update parent component
        if (onLikeUpdate) {
          onLikeUpdate({
            ...video,
            isLiked: data.isLiked,
            likeCount: data.likeCount,
          });
        }
      }
    } catch (error) {
      console.error('Error liking video:', error);
      // rollback optimistic update
      setIsLiked(prevLiked);
      setLikeCount(prevCount);
      Alert.alert('Error', 'Failed to like video. Please try again.');
    }
  };

  const handleComment = () => {
    // TODO: Implement comment functionality
    Alert.alert('Coming Soon', 'Comment functionality will be available soon!');
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    Alert.alert('Coming Soon', 'Share functionality will be available soon!');
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
            <View style={[styles.actionIcon, isLiked && styles.actionIconLiked]}>
              <Text style={styles.actionEmoji}>{isLiked ? '❤️' : '🤍'}</Text>
            </View>
            <Text style={styles.actionText}>{formatCount(likeCount)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
            <View style={styles.actionIcon}>
              <Text style={styles.actionEmoji}>💬</Text>
            </View>
            <Text style={styles.actionText}>{formatCount(video.commentCount || 0)}</Text>
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
  actionIconLiked: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
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

