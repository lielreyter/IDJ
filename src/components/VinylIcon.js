import React from 'react';
import { View, StyleSheet } from 'react-native';

const VinylIcon = ({ size = 24, color = '#fff' }) => {
  const iconSize = size;
  const centerSize = iconSize * 0.3;
  const ringSize = iconSize * 0.15;

  return (
    <View style={[styles.container, { width: iconSize, height: iconSize }]}>
      {/* Outer ring */}
      <View
        style={[
          styles.ring,
          {
            width: iconSize,
            height: iconSize,
            borderRadius: iconSize / 2,
            borderWidth: ringSize,
            borderColor: color,
          },
        ]}
      />
      {/* Inner circle (center label) */}
      <View
        style={[
          styles.center,
          {
            width: centerSize,
            height: centerSize,
            borderRadius: centerSize / 2,
            backgroundColor: color,
          },
        ]}
      />
      {/* Grooves (concentric circles) */}
      <View
        style={[
          styles.groove,
          {
            width: iconSize * 0.7,
            height: iconSize * 0.7,
            borderRadius: (iconSize * 0.7) / 2,
            borderWidth: 1,
            borderColor: color,
            opacity: 0.3,
          },
        ]}
      />
      <View
        style={[
          styles.groove,
          {
            width: iconSize * 0.5,
            height: iconSize * 0.5,
            borderRadius: (iconSize * 0.5) / 2,
            borderWidth: 1,
            borderColor: color,
            opacity: 0.3,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ring: {
    position: 'absolute',
    borderStyle: 'solid',
  },
  center: {
    position: 'absolute',
  },
  groove: {
    position: 'absolute',
  },
});

export default VinylIcon;

