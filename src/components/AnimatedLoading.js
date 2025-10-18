import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

const { width } = Dimensions.get('window');

/**
 * Animated Loading Component
 * Shows a smooth loading indicator with optional message
 */
const AnimatedLoading = ({ 
  visible = false, 
  message = 'Loading...',
  size = 'large',
  color = '#2E7D32'
}) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator 
          animating={true} 
          size={size} 
          color={color}
          style={styles.spinner}
        />
        {message && (
          <Text style={styles.message} variant="bodyMedium">
            {message}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: width * 0.6,
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    color: '#333',
    fontWeight: '500',
  },
});

export default AnimatedLoading;
