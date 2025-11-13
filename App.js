import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import VideoFeed from './src/components/VideoFeed';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <VideoFeed />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});