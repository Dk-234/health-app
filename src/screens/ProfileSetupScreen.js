import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileSetupSchema = Yup.object().shape({
  age: Yup.number()
    .min(1, 'Age must be at least 1')
    .max(150, 'Age must be less than 150')
    .required('Age is required'),
  phone: Yup.string()
    .matches(/^[0-9\-\+\(\)]*$/, 'Phone number is invalid')
    .min(10, 'Phone number must be at least 10 characters')
    .required('Phone is required'),
  answer1: Yup.string()
    .min(1, 'Please provide an answer')
    .required('Answer 1 is required'),
  answer2: Yup.string()
    .min(1, 'Please provide an answer')
    .required('Answer 2 is required'),
  answer3: Yup.string()
    .min(1, 'Please provide an answer')
    .required('Answer 3 is required'),
});

const ProfileSetupScreen = ({ navigation }) => {
  const { completeProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarUri, setAvatarUri] = useState(null);
  const [securityQuestions, setSecurityQuestions] = useState([]);

  useEffect(() => {
    // Load security questions when component mounts
    loadSecurityQuestions();
  }, []);

  const loadSecurityQuestions = async () => {
    try {
      const questions = await authService.getSecurityQuestions();
      setSecurityQuestions(questions);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to load security questions');
    }
  };

  const selectAvatar = () => {
    const defaultAvatars = [
      '👤', '😊', '😎', '🤓', '😍', '🥸', '🤠', '🧑', '👨', '👩'
    ];
    
    Alert.alert(
      'Select Avatar',
      'Choose an avatar to represent yourself',
      [
        ...defaultAvatars.map((avatar, index) => ({
          text: avatar,
          onPress: () => setAvatarUri(avatar),
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleCompleteProfile = async (values) => {
    if (!avatarUri) {
      Alert.alert('Error', 'Please select an avatar');
      return;
    }

    setLoading(true);
    try {
      // Prepare security questions data
      const securityQuestionsData = [
        {
          questionId: securityQuestions[0]?.id,
          question: securityQuestions[0]?.question,
          answer: values.answer1,
        },
        {
          questionId: securityQuestions[1]?.id,
          question: securityQuestions[1]?.question,
          answer: values.answer2,
        },
        {
          questionId: securityQuestions[2]?.id,
          question: securityQuestions[2]?.question,
          answer: values.answer3,
        },
      ];

      await completeProfile(
        values.age,
        values.phone,
        avatarUri,
        securityQuestionsData
      );

      Alert.alert(
        'Success', 
        'Profile setup completed! You will now be logged in automatically.',
        [{ text: 'OK', onPress: () => navigation.replace('Dashboard') }]
      );
    } catch (error) {
      // If auto-login failed, user needs to login manually
      if (error.message.includes('Please login')) {
        Alert.alert(
          'Profile Completed',
          'Your profile has been successfully set up! Please login with your credentials to continue.',
          [{ text: 'OK', onPress: () => navigation.replace('Login') }]
        );
      } else {
        Alert.alert('Error', error.message || 'Failed to complete profile setup');
      }
    } finally {
      setLoading(false);
    }
  };

  if (securityQuestions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading security questions...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Help us personalize your experience and secure your account
          </Text>
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={selectAvatar}
          >
            <View style={styles.avatar}>
              {avatarUri ? (
                <Text style={styles.avatarText}>{avatarUri}</Text>
              ) : (
                <MaterialCommunityIcons
                  name="image-plus"
                  size={60}
                  color="#2196F3"
                />
              )}
            </View>
            <Text style={styles.avatarHelper}>
              {avatarUri ? 'Tap to change' : 'Tap to select avatar'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Section */}
        <Formik
          initialValues={{
            age: '',
            phone: '',
            answer1: '',
            answer2: '',
            answer3: '',
          }}
          validationSchema={ProfileSetupSchema}
          onSubmit={handleCompleteProfile}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <View style={styles.formSection}>
              {/* Age Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Age *</Text>
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
                  left={<TextInput.Icon icon="calendar" color="#2196F3" />}
                />
                {touched.age && errors.age && (
                  <Text style={styles.errorText}>{errors.age}</Text>
                )}
              </View>

              {/* Phone Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number *</Text>
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
                  left={<TextInput.Icon icon="phone" color="#2196F3" />}
                />
                {touched.phone && errors.phone && (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                )}
              </View>

              {/* Security Questions Section */}
              <View style={styles.securitySection}>
                <Text style={styles.securityTitle}>Security Questions</Text>
                <Text style={styles.securitySubtitle}>
                  These help you recover your account if you forget your password
                </Text>

                {/* Question 1 */}
                <View style={styles.questionGroup}>
                  <Text style={styles.questionLabel}>
                    {securityQuestions[0]?.question}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Your answer"
                    value={values.answer1}
                    onChangeText={handleChange('answer1')}
                    onBlur={handleBlur('answer1')}
                    mode="outlined"
                    outlineColor="#ddd"
                    activeOutlineColor="#2196F3"
                    editable={!loading}
                  />
                  {touched.answer1 && errors.answer1 && (
                    <Text style={styles.errorText}>{errors.answer1}</Text>
                  )}
                </View>

                {/* Question 2 */}
                <View style={styles.questionGroup}>
                  <Text style={styles.questionLabel}>
                    {securityQuestions[1]?.question}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Your answer"
                    value={values.answer2}
                    onChangeText={handleChange('answer2')}
                    onBlur={handleBlur('answer2')}
                    mode="outlined"
                    outlineColor="#ddd"
                    activeOutlineColor="#2196F3"
                    editable={!loading}
                  />
                  {touched.answer2 && errors.answer2 && (
                    <Text style={styles.errorText}>{errors.answer2}</Text>
                  )}
                </View>

                {/* Question 3 */}
                <View style={styles.questionGroup}>
                  <Text style={styles.questionLabel}>
                    {securityQuestions[2]?.question}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Your answer"
                    value={values.answer3}
                    onChangeText={handleChange('answer3')}
                    onBlur={handleBlur('answer3')}
                    mode="outlined"
                    outlineColor="#ddd"
                    activeOutlineColor="#2196F3"
                    editable={!loading}
                  />
                  {touched.answer3 && errors.answer3 && (
                    <Text style={styles.errorText}>{errors.answer3}</Text>
                  )}
                </View>
              </View>

              {/* Submit Button */}
              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
                style={styles.button}
                labelStyle={styles.buttonLabel}
              >
                Complete Setup & Login
              </Button>

              <View style={styles.infoBox}>
                <MaterialCommunityIcons
                  name="information"
                  size={16}
                  color="#1976D2"
                  style={styles.infoIcon}
                />
                <Text style={styles.infoText}>
                  Keep your security answers safe. You'll need them to reset your password.
                </Text>
              </View>
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  avatarText: {
    fontSize: 50,
  },
  avatarHelper: {
    fontSize: 12,
    color: '#666',
  },
  formSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fafafa',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 4,
  },
  securitySection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  securitySubtitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
  },
  questionGroup: {
    marginBottom: 16,
  },
  questionLabel: {
    fontSize: 13,
    color: '#555',
    marginBottom: 8,
    fontWeight: '500',
  },
  button: {
    marginTop: 24,
    paddingVertical: 8,
    backgroundColor: '#2196F3',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    fontSize: 12,
    color: '#1565c0',
    flex: 1,
  },
});

export default ProfileSetupScreen;
