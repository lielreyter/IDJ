import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Text,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import VideoItem from './VideoItem';
import { API_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const VideoFeed = ({ navigation }) => {
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const flatListRef = useRef(null);
  const { token } = useAuth();

  const fetchVideos = async (pageNum = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else if (!refreshing) {
        setLoading(true);
      }
      setError(null);
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/videos?page=${pageNum}&limit=10`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Transform API data to match VideoItem expected format
        const transformedVideos = data.videos.map(video => ({
          id: video._id || video.id,
          uri: video.videoUrl,
          user: `@${video.username}`,
          description: video.description || video.title || '',
          likeCount: video.likeCount || 0,
          commentCount: video.commentCount || 0,
          isLiked: video.isLiked || false,
          views: video.views || 0,
          videoId: video._id || video.id,
        }));

        if (append) {
          setVideos(prev => [...prev, ...transformedVideos]);
        } else {
          setVideos(transformedVideos);
        }

        setHasMore(data.pagination.page < data.pagination.pages);
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      } else {
        throw new Error(data.error || 'Failed to fetch videos');
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError(error.message);
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVideos(1, false);
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      setCurrentIndex(index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleLoadMore = () => {
    if (loading || loadingMore || refreshing || !hasMore) return;
    if (videos.length === 0) return;
      const nextPage = page + 1;
      setPage(nextPage);
      fetchVideos(nextPage, true);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    fetchVideos(1, false);
  };

  const renderItem = ({ item, index }) => (
    <VideoItem
      video={item}
      isActive={index === currentIndex}
      index={index}
      onLikeUpdate={(updatedVideo) => {
        setVideos(prev => 
          prev.map(v => v.id === updatedVideo.id ? updatedVideo : v)
        );
      }}
    />
  );

  if (loading && videos.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading videos...</Text>
      </View>
    );
  }

  if (error && videos.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text style={styles.errorSubtext}>Pull down to refresh or tap retry</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchVideos(1, false)}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!loading && videos.length === 0 && !error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.emptyTitle}>No videos yet</Text>
        <Text style={styles.emptySubtext}>Pull down to refresh or upload your first video.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(data, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#fff"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          (loading || loadingMore) && videos.length > 0 ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          ) : null
        }
      />
      {navigation && (
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => {
            // Navigate to Upload screen in the parent Stack navigator
            navigation.getParent()?.navigate('Upload');
          }}
        >
          <Text style={styles.uploadButtonText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  errorSubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  uploadButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  uploadButtonText: {
    color: '#000',
    fontSize: 32,
    fontWeight: '300',
  },
});

export default VideoFeed;

