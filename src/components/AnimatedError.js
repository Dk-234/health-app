import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Modal, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

/**
 * Animated Error Component
 * Shows a beautiful error dialog with icon animation and action buttons
 */
const AnimatedError = ({ 
  visible = false, 
  title = 'Oops!',
  message = 'Something went wrong',
  onDismiss = () => {},
  onRetry = null,
  showRetry = false,
}) => {
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (visible) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <View style={styles.container}>
        <View style={[styles.content, shake && styles.shake]}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons 
              name="alert-circle" 
              size={64} 
              color="#D32F2F"
            />
          </View>
          
          <Text 
            variant="headlineSmall" 
            style={styles.title}
          >
            {title}
          </Text>
          
          <Text 
            variant="bodyMedium" 
            style={styles.message}
          >
            {message}
          </Text>

          <View style={styles.buttonContainer}>
            {showRetry && onRetry && (
              <Button
                mode="contained"
                onPress={onRetry}
                style={styles.retryButton}
                labelStyle={styles.buttonLabel}
                icon="refresh"
              >
                Retry
              </Button>
            )}
            <Button
              mode={showRetry && onRetry ? "outlined" : "contained"}
              onPress={onDismiss}
              style={styles.dismissButton}
              labelStyle={styles.buttonLabel}
            >
              Dismiss
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    width: width * 0.85,
    maxWidth: 400,
  },
  shake: {
    transform: [{ translateX: 10 }],
  },
  iconContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 50,
    backgroundColor: '#FFEBEE',
  },
  title: {
    color: '#D32F2F',
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  retryButton: {
    flex: 1,
    backgroundColor: '#2E7D32',
  },
  dismissButton: {
    flex: 1,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AnimatedError;
