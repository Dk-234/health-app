import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';

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

  const handleUpdateProfile = async (values) => {
    if (!user) return;

    try {
      setLoading(true);
      
      const updates = {
        name: values.name,
        age: values.age ? parseInt(values.age) : null,
        phone: values.phone || null,
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


              </View>
            )}
          </Formik>
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
});

export default ProfileScreen;
