import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import VideoFeed from '../components/VideoFeed';

const HomeScreen = () => {
  const navigation = useNavigation();
  
  return (
    <View style={styles.container}>
      <VideoFeed navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});

export default HomeScreen;

