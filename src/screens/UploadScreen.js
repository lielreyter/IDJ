import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
// Note: expo-image-picker needs to be installed: npm install expo-image-picker
// For now, we'll use a try-catch to handle if it's not available
let ImagePicker;
try {
  ImagePicker = require('expo-image-picker');
} catch (e) {
  console.warn('expo-image-picker not installed. Run: npm install expo-image-picker');
}
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';

const UploadScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUri, setVideoUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { token } = useAuth();

  const pickVideo = async () => {
    if (!ImagePicker) {
      Alert.alert(
        'Package Required',
        'expo-image-picker is not installed.\n\nPlease run: npm install expo-image-picker\n\nYou can also manually add videos by providing URLs through the backend API.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need access to your media library to upload videos.');
        return;
      }

      // Pick video
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 60, // 60 seconds max
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setVideoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video. Please try again.');
    }
  };

  const uploadVideo = async () => {
    if (!videoUri) {
      Alert.alert('Error', 'Please select a video to upload');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'Please log in to upload videos');
      navigation.navigate('Login');
      return;
    }

    setUploading(true);

    try {
      // For now, we'll use a simple approach where the video URL is provided
      // In production, you would upload the video file to S3/Cloudinary first
      // and then send the URL to the backend
      
      // TODO: Upload video file to storage service (S3/Cloudinary) first
      // For now, we'll use the local URI (this won't work in production)
      // You'll need to implement actual file upload to your storage service
      
      Alert.alert(
        'Upload Feature',
        'Video upload requires a storage service (S3/Cloudinary).\n\nFor now, you can manually add video URLs through the backend API.\n\nTo implement full upload:\n1. Set up AWS S3 or Cloudinary\n2. Upload video file to storage\n3. Get the video URL\n4. Send URL to backend',
        [
          {
            text: 'OK',
            onPress: () => {
              // For demo purposes, we'll create a video with a placeholder URL
              // In production, replace this with actual upload logic
              createVideoWithUrl(videoUri);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error uploading video:', error);
      Alert.alert('Error', 'Failed to upload video. Please try again.');
      setUploading(false);
    }
  };

  const createVideoWithUrl = async (url) => {
    try {
      // This is a placeholder - in production, you'd upload to S3/Cloudinary first
      const response = await fetch(`${API_URL}/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim() || undefined,
          description: description.trim() || undefined,
          videoUrl: url, // In production, this would be the S3/Cloudinary URL
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Video uploaded successfully!', [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      } else {
        throw new Error(data.error || 'Failed to upload video');
      }
    } catch (error) {
      console.error('Error creating video:', error);
      Alert.alert('Error', error.message || 'Failed to upload video. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upload Video</Text>
          <TouchableOpacity
            style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
            onPress={uploadVideo}
            disabled={uploading || !videoUri}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.uploadButtonText}>Upload</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <TouchableOpacity
            style={[styles.videoPicker, videoUri && styles.videoPickerSelected]}
            onPress={pickVideo}
            disabled={uploading}
          >
            {videoUri ? (
              <View style={styles.videoSelected}>
                <Text style={styles.videoSelectedText}>✓ Video Selected</Text>
                <Text style={styles.videoSelectedSubtext}>Tap to change</Text>
              </View>
            ) : (
              <View style={styles.videoPickerPlaceholder}>
                <Text style={styles.videoPickerIcon}>📹</Text>
                <Text style={styles.videoPickerText}>Select Video</Text>
                <Text style={styles.videoPickerSubtext}>Choose a video from your library</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.form}>
            <Text style={styles.label}>Title (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter video title"
              placeholderTextColor="#666"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
              editable={!uploading}
            />

            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your video"
              placeholderTextColor="#666"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={500}
              editable={!uploading}
            />
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              📝 Note: Full video upload requires a storage service (AWS S3 or Cloudinary).
              {'\n\n'}For now, you can:
              {'\n'}• Select a video from your library (requires expo-image-picker)
              {'\n'}• Or manually enter a video URL in the video picker
              {'\n\n'}To enable full upload, set up AWS S3 or Cloudinary and update the upload logic.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  uploadButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  uploadButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  videoPicker: {
    width: '100%',
    height: 200,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  videoPickerSelected: {
    borderColor: '#fff',
    borderStyle: 'solid',
  },
  videoPickerPlaceholder: {
    alignItems: 'center',
  },
  videoPickerIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  videoPickerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  videoPickerSubtext: {
    color: '#999',
    fontSize: 14,
  },
  videoSelected: {
    alignItems: 'center',
  },
  videoSelectedText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  videoSelectedSubtext: {
    color: '#999',
    fontSize: 14,
  },
  form: {
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  infoBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  infoText: {
    color: '#999',
    fontSize: 12,
    lineHeight: 18,
  },
});

export default UploadScreen;

