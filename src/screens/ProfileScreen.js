import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const ProfileSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  age: Yup.number()
    .min(1, 'Age must be at least 1')
    .max(150, 'Age must be less than 150')
    .nullable(),
  phone: Yup.string()
    .matches(/^[0-9\-\+\(\)]*$/, 'Phone number is invalid')
    .min(10, 'Phone number must be at least 10 characters')
    .nullable(),
});

const ProfileScreen = ({ navigation }) => {
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarUri, setAvatarUri] = useState(user?.avatar || null);

  const handleUpdateProfile = async (values) => {
    if (!user) return;

    try {
      setLoading(true);
      
      const updates = {
        name: values.name,
        age: values.age ? parseInt(values.age) : null,
        phone: values.phone || null,
        avatar: avatarUri,
      };

      await updateUserProfile(updates);
      
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const selectAvatar = () => {
    // For now, use a placeholder. In a real app, you'd use expo-image-picker
    const defaultAvatars = [
      '👤', // Default user icon
      '😊', '😎', '🤓', '😍', '🥸', '🤠', '🧑', '👨', '👩'
    ];
    
    Alert.alert(
      'Select Avatar',
      'Choose an avatar or use default',
      [
        ...defaultAvatars.map((avatar, index) => ({
          text: avatar,
          onPress: () => setAvatarUri(avatar),
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={styles.profilePictureSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={selectAvatar}
          >
            <View style={styles.avatar}>
              {avatarUri ? (
                <Text style={styles.avatarText}>{avatarUri}</Text>
              ) : (
                <MaterialCommunityIcons
                  name="account-circle"
                  size={80}
                  color="#2196F3"
                />
              )}
            </View>
            <View style={styles.editBadge}>
              <MaterialCommunityIcons
                name="pencil"
                size={16}
                color="white"
              />
            </View>
          </TouchableOpacity>
          <Text style={styles.profileEmail}>{user.email}</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Formik
            initialValues={{
              name: user.name || '',
              age: user.age ? String(user.age) : '',
              phone: user.phone || '',
            }}
            validationSchema={ProfileSchema}
            onSubmit={handleUpdateProfile}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <View style={styles.form}>
                {/* Name Field */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    value={values.name}
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                    mode="outlined"
                    outlineColor="#ddd"
                    activeOutlineColor="#2196F3"
                    editable={!loading}
                    left={
                      <TextInput.Icon
                        icon="account"
                        color="#2196F3"
                      />
                    }
                  />
                  {touched.name && errors.name && (
                    <Text style={styles.errorText}>{errors.name}</Text>
                  )}
                </View>

                {/* Age Field */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Age</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your age"
                    value={values.age}
                    onChangeText={handleChange('age')}
                    onBlur={handleBlur('age')}
                    mode="outlined"
                    outlineColor="#ddd"
                    activeOutlineColor="#2196F3"
                    keyboardType="numeric"
                    editable={!loading}
                    left={
                      <TextInput.Icon
                        icon="calendar"
                        color="#2196F3"
                      />
                    }
                  />
                  {touched.age && errors.age && (
                    <Text style={styles.errorText}>{errors.age}</Text>
                  )}
                </View>

                {/* Phone Field */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your phone number"
                    value={values.phone}
                    onChangeText={handleChange('phone')}
                    onBlur={handleBlur('phone')}
                    mode="outlined"
                    outlineColor="#ddd"
                    activeOutlineColor="#2196F3"
                    keyboardType="phone-pad"
                    editable={!loading}
                    left={
                      <TextInput.Icon
                        icon="phone"
                        color="#2196F3"
                      />
                    }
                  />
                  {touched.phone && errors.phone && (
                    <Text style={styles.errorText}>{errors.phone}</Text>
                  )}
                </View>

                {/* Buttons */}
                <View style={styles.buttonGroup}>
                  <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={loading}
                    disabled={loading}
                    style={styles.saveButton}
                    labelStyle={styles.buttonLabel}
                  >
                    Save Changes
                  </Button>

                  <Button
                    mode="outlined"
                    onPress={() => navigation.goBack()}
                    disabled={loading}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </Button>
                </View>
              </View>
            )}
          </Formik>
        </View>

        {/* Account Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Member Since:</Text>
            <Text style={styles.infoValue}>
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Password Reset Section */}
        <View style={styles.securitySection}>
          <Text style={styles.sectionTitle}>Account Security</Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.resetPasswordButton}
            labelStyle={styles.buttonLabel}
            icon="lock-reset"
          >
            Change Password
          </Button>
          <Text style={styles.securityInfo}>
            You'll need to answer your security questions to change your password.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  profilePictureSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2196F3',
  },
  avatarText: {
    fontSize: 48,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  formSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    fontSize: 14,
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 6,
  },
  buttonGroup: {
    gap: 12,
    marginTop: 20,
  },
  saveButton: {
    paddingVertical: 8,
    backgroundColor: '#2196F3',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 8,
    borderColor: '#2196F3',
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  securitySection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  resetPasswordButton: {
    paddingVertical: 8,
    backgroundColor: '#FF9800',
    marginBottom: 12,
  },
  securityInfo: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
});

export default ProfileScreen;
