import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import CaptchaComponent from '../components/CaptchaComponent';
import AnimatedLoading from '../components/AnimatedLoading';
import AnimatedError from '../components/AnimatedError';
import AnimatedSuccess from '../components/AnimatedSuccess';

const PasswordResetSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
});

const AnswerSchema = Yup.object().shape({
  answer1: Yup.string().min(1, 'Please provide an answer').required('Required'),
  answer2: Yup.string().min(1, 'Please provide an answer').required('Required'),
  answer3: Yup.string().min(1, 'Please provide an answer').required('Required'),
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const ForgotPasswordScreen = ({ navigation }) => {
  const { resetPassword } = useAuth();
  const [step, setStep] = useState(1); // 1: Email, 2: Security Questions, 3: New Password
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [email, setEmail] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [securityQuestions, setSecurityQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});

  // Error state
  const [errorState, setErrorState] = useState({
    visible: false,
    title: 'Error',
    message: '',
    showRetry: false,
    onRetry: null,
  });

  // Success state
  const [successState, setSuccessState] = useState({
    visible: false,
    message: 'Success!',
  });

  const showError = (title, message, onRetry = null) => {
    setErrorState({
      visible: true,
      title,
      message,
      showRetry: !!onRetry,
      onRetry,
    });
  };

  const dismissError = () => {
    setErrorState({ ...errorState, visible: false });
  };

  const handleCaptchaVerify = (verified, token) => {
    setCaptchaVerified(verified);
  };

  // Step 1: Enter email
  const handleEmailSubmit = async (values) => {
    if (!captchaVerified) {
      Alert.alert('Error', 'Please verify the CAPTCHA first');
      return;
    }

    setLoading(true);
    setLoadingMessage('Fetching security questions...');
    try {
      setEmail(values.email);
      // Move to security questions step
      // In a real implementation, you'd fetch security questions from backend for this user
      const questions = await authService.getSecurityQuestions();
      setSecurityQuestions(questions);
      setStep(2);
      setCaptchaVerified(false);
    } catch (error) {
      setLoading(false);
      showError('Failed to Fetch Questions', error.message || 'Could not load security questions');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Answer security questions
  const handleSecurityQuestionsSubmit = async (values) => {
    if (!values.answer1 || !values.answer2 || !values.answer3) {
      Alert.alert('Error', 'Please answer all security questions');
      return;
    }

    setLoading(true);
    setLoadingMessage('Verifying answers...');
    try {
      // Optionally validate answers on backend before moving to password step
      // For now, we'll just store them and move to next step
      setUserAnswers({
        answer1: values.answer1,
        answer2: values.answer2,
        answer3: values.answer3,
      });

      setLoading(false);
      setStep(3);
    } catch (error) {
      setLoading(false);
      showError('Verification Failed', error.message || 'Could not verify answers');
    }
  };

  // Step 3: Set new password and reset
  const handlePasswordReset = async (values) => {
    setLoading(true);
    setLoadingMessage('Resetting password...');
    try {
      const answers = [
        userAnswers.answer1,
        userAnswers.answer2,
        userAnswers.answer3,
      ];

      await resetPassword(email, answers, values.newPassword);

      setLoading(false);
      Alert.alert(
        'Success',
        'Your password has been reset successfully. Please login with your new password.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      setLoading(false);
      showError('Password Reset Failed', error.message || 'Failed to reset password');
    }
  };

  if (step === 1) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Animated Loading */}
        <AnimatedLoading 
          visible={loading} 
          message={loadingMessage}
          size="large"
          color="#2E7D32"
        />

        {/* Animated Error */}
        <AnimatedError
          visible={errorState.visible}
          title={errorState.title}
          message={errorState.message}
          showRetry={errorState.showRetry}
          onRetry={errorState.onRetry}
          onDismiss={dismissError}
        />

        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your email address to begin the reset process
            </Text>
          </View>

          <Formik
            initialValues={{ email: '' }}
            validationSchema={PasswordResetSchema}
            onSubmit={handleEmailSubmit}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View style={styles.form}>
                <TextInput
                  label="Email"
                  mode="outlined"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  error={touched.email && !!errors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                  left={<TextInput.Icon icon="email" />}
                />
                {touched.email && errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}

                <CaptchaComponent onVerify={handleCaptchaVerify} />

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                  labelStyle={styles.buttonLabel}
                >
                  Continue
                </Button>

                <Button
                  mode="text"
                  onPress={() => navigation.navigate('Login')}
                  style={styles.linkButton}
                >
                  Back to Login
                </Button>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  if (step === 2) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Animated Loading */}
        <AnimatedLoading 
          visible={loading} 
          message={loadingMessage}
          size="large"
          color="#2E7D32"
        />

        {/* Animated Error */}
        <AnimatedError
          visible={errorState.visible}
          title={errorState.title}
          message={errorState.message}
          onDismiss={dismissError}
        />

        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>Security Verification</Text>
            <Text style={styles.subtitle}>
              Please answer the following security questions
            </Text>
          </View>

          <Formik
            initialValues={{
              answer1: '',
              answer2: '',
              answer3: '',
            }}
            validationSchema={AnswerSchema}
            onSubmit={handleSecurityQuestionsSubmit}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View style={styles.form}>
                {securityQuestions.map((question, index) => (
                  <View key={question.id} style={styles.questionGroup}>
                    <Text style={styles.questionText}>{question.question}</Text>
                    <TextInput
                      mode="outlined"
                      placeholder="Your answer"
                      value={values[`answer${index + 1}`]}
                      onChangeText={handleChange(`answer${index + 1}`)}
                      onBlur={handleBlur(`answer${index + 1}`)}
                      style={styles.input}
                      editable={!loading}
                    />
                    {touched[`answer${index + 1}`] && errors[`answer${index + 1}`] && (
                      <Text style={styles.errorText}>
                        {errors[`answer${index + 1}`]}
                      </Text>
                    )}
                  </View>
                ))}

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                  labelStyle={styles.buttonLabel}
                >
                  Verify & Continue
                </Button>

                <Button
                  mode="text"
                  onPress={() => setStep(1)}
                  style={styles.linkButton}
                >
                  Back
                </Button>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Step 3: New Password
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Animated Loading */}
      <AnimatedLoading 
        visible={loading} 
        message={loadingMessage}
        size="large"
        color="#2E7D32"
      />

      {/* Animated Error */}
      <AnimatedError
        visible={errorState.visible}
        title={errorState.title}
        message={errorState.message}
        onDismiss={dismissError}
      />

      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Create New Password</Text>
          <Text style={styles.subtitle}>
            Enter a strong password for your account
          </Text>
        </View>

        <Formik
          initialValues={{
            answer1: userAnswers.answer1 || '',
            answer2: userAnswers.answer2 || '',
            answer3: userAnswers.answer3 || '',
            newPassword: '',
            confirmPassword: '',
          }}
          validationSchema={AnswerSchema}
          onSubmit={handlePasswordReset}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.form}>
              <TextInput
                label="New Password"
                mode="outlined"
                value={values.newPassword}
                onChangeText={handleChange('newPassword')}
                onBlur={handleBlur('newPassword')}
                error={touched.newPassword && !!errors.newPassword}
                secureTextEntry
                style={styles.input}
                left={<TextInput.Icon icon="lock" />}
              />
              {touched.newPassword && errors.newPassword && (
                <Text style={styles.errorText}>{errors.newPassword}</Text>
              )}

              <TextInput
                label="Confirm Password"
                mode="outlined"
                value={values.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                error={touched.confirmPassword && !!errors.confirmPassword}
                secureTextEntry
                style={styles.input}
                left={<TextInput.Icon icon="lock-check" />}
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}

              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
                style={styles.button}
                labelStyle={styles.buttonLabel}
              >
                Reset Password
              </Button>

              <Button
                mode="text"
                onPress={() => setStep(2)}
                style={styles.linkButton}
              >
                Back
              </Button>
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
  scrollView: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
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
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 12,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
    backgroundColor: '#2196F3',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 8,
  },
  questionGroup: {
    marginBottom: 16,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
});

export default ForgotPasswordScreen;
