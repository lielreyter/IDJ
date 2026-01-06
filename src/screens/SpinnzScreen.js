import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SpinnzScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spinnz</Text>
      <Text style={styles.subtitle}>Short form videos</Text>
      <Text style={styles.comingSoon}>Coming soon...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: '#999',
    fontSize: 18,
    marginBottom: 20,
  },
  comingSoon: {
    color: '#666',
    fontSize: 14,
  },
});

export default SpinnzScreen;

