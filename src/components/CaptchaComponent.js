import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Button } from 'react-native-paper';

const CaptchaComponent = ({ onVerify }) => {
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaValue, setCaptchaValue] = useState(generateCaptcha());
  const [error, setError] = useState('');

  function generateCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
      captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return captcha;
  }

  const handleRefresh = () => {
    setCaptchaValue(generateCaptcha());
    setCaptchaInput('');
    setError('');
  };

  const handleVerify = () => {
    if (captchaInput.toLowerCase() === captchaValue.toLowerCase()) {
      setError('');
      onVerify(true, captchaValue);
    } else {
      setError('Invalid CAPTCHA. Please try again.');
      handleRefresh();
      onVerify(false, null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Verify you're human:</Text>
      
      <View style={styles.captchaBox}>
        <View style={styles.captchaDisplay}>
          <Text style={styles.captchaText}>{captchaValue}</Text>
        </View>
        
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Text style={styles.refreshIcon}>↻</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Enter CAPTCHA"
        value={captchaInput}
        onChangeText={setCaptchaInput}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Button 
        mode="contained" 
        onPress={handleVerify}
        style={styles.verifyButton}
      >
        Verify CAPTCHA
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  captchaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  captchaDisplay: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  captchaText: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 5,
    textAlign: 'center',
    color: '#2196F3',
    fontFamily: 'monospace',
  },
  refreshButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 5,
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginBottom: 10,
  },
  verifyButton: {
    marginTop: 5,
  },
});

export default CaptchaComponent;
