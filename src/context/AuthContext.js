import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import preferencesService from '../services/preferencesService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);
  const [preferences, setPreferences] = useState(null);

  useEffect(() => {
    // Initialize auth on app start
    const initializeAuth = async () => {
      try {
        // Check if user is already logged in
        const token = await AsyncStorage.getItem('@auth_token');
        const userData = await AsyncStorage.getItem('@user_data');

        if (token && userData) {
          setAuthToken(token);
          setUser(JSON.parse(userData));
        }

        setLoading(false);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email, password) => {
    try {
      const userData = await authService.login(email, password);
      
      // Only set token if profile is completed
      if (userData.token) {
        setAuthToken(userData.token);
        await AsyncStorage.setItem('@auth_token', userData.token);
      }
      
      setUser({
        uid: userData.uid,
        email: userData.email,
        name: userData.name,
        age: userData.age,
        phone: userData.phone,
        avatar: userData.avatar,
        createdAt: userData.createdAt,
        profileCompleted: userData.profileCompleted
      });
      
      // Store user data in AsyncStorage
      await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
      
      // If profile completed and token available, load preferences
      if (userData.profileCompleted && userData.token) {
        try {
          const prefs = await preferencesService.getPreferences();
          setPreferences(prefs);
          await AsyncStorage.setItem('@user_preferences', JSON.stringify(prefs));
        } catch (prefError) {
          console.warn('Could not load preferences:', prefError);
        }
      }
      
      // If profile not completed, store pending data for profile setup
      if (!userData.profileCompleted) {
        await AsyncStorage.setItem('@pending_uid', userData.uid);
        await AsyncStorage.setItem('@pending_email', userData.email);
      }
      
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email, password, name) => {
    try {
      const userData = await authService.register(email, password, name);
      // After registration, user is NOT auto-logged in - profile setup needed first
      // Store only the uid for profile setup
      await AsyncStorage.setItem('@pending_uid', userData.uid);
      await AsyncStorage.setItem('@pending_email', userData.email);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const completeProfile = async (age, phone, avatar, securityQuestions) => {
    try {
      const pendingUid = await AsyncStorage.getItem('@pending_uid');
      const pendingEmail = await AsyncStorage.getItem('@pending_email');
      let tempPassword = await AsyncStorage.getItem('@pending_password');
      
      if (!pendingUid || !pendingEmail) {
        throw new Error('No pending profile found');
      }

      await authService.completeProfile(pendingUid, age, phone, avatar, securityQuestions);

      // If password not available (e.g., existing user logging in with profile setup)
      // We'll trigger a re-login via LoginScreen
      if (!tempPassword) {
        // Clear pending data and navigate back to login
        await AsyncStorage.removeItem('@pending_uid');
        await AsyncStorage.removeItem('@pending_email');
        await AsyncStorage.removeItem('@pending_password');
        
        throw new Error('Profile completed! Please login again with your credentials.');
      }

      // Now auto-login the user with stored password
      try {
        const loginData = await authService.login(pendingEmail, tempPassword);
        
        // Only set token if available (profile completed)
        if (loginData.token) {
          setAuthToken(loginData.token);
          await AsyncStorage.setItem('@auth_token', loginData.token);
        }
        
        setUser({
          uid: loginData.uid,
          email: loginData.email,
          name: loginData.name,
          age: loginData.age,
          phone: loginData.phone,
          avatar: loginData.avatar,
          createdAt: loginData.createdAt,
          profileCompleted: loginData.profileCompleted || true
        });

        // Store user data in AsyncStorage
        await AsyncStorage.setItem('@user_data', JSON.stringify(loginData));
        
        // Load preferences after successful login
        if (loginData.token && loginData.profileCompleted) {
          try {
            const prefs = await preferencesService.getPreferences();
            setPreferences(prefs);
            await AsyncStorage.setItem('@user_preferences', JSON.stringify(prefs));
          } catch (prefError) {
            console.warn('Could not load preferences:', prefError);
          }
        }
        
        // Clear temporary data
        await AsyncStorage.removeItem('@pending_uid');
        await AsyncStorage.removeItem('@pending_email');
        await AsyncStorage.removeItem('@pending_password');

        return loginData;
      } catch (loginError) {
        console.error('Auto-login error:', loginError);
        
        // Clear temporary data on login failure
        await AsyncStorage.removeItem('@pending_uid');
        await AsyncStorage.removeItem('@pending_email');
        await AsyncStorage.removeItem('@pending_password');
        
        throw new Error('Profile completed! Please login with your credentials.');
      }
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setAuthToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const resetPassword = async (email, answers, newPassword) => {
    try {
      return await authService.resetPassword(email, answers, newPassword);
    } catch (error) {
      throw error;
    }
  };

  const updateUserProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      await authService.updateProfile(user.uid, updates);
      const updatedUser = {
        ...user,
        ...updates
      };
      
      setUser(updatedUser);
      await AsyncStorage.setItem('@user_data', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const changePassword = async (passwordData) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      const result = await preferencesService.changePassword(passwordData);
      return result;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error.response?.data?.error || error.message || 'Failed to change password';
    }
  };

  const updateProfile = async (profileData) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      const result = await preferencesService.updateProfile(profileData);
      
      // Update local user state with returned data
      const updatedUser = {
        ...user,
        ...result
      };
      
      setUser(updatedUser);
      await AsyncStorage.setItem('@user_data', JSON.stringify(updatedUser));
      
      return result;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error.response?.data?.error || error.message || 'Failed to update profile';
    }
  };

  const loadPreferences = async () => {
    try {
      if (!user) throw new Error('No user logged in');
      
      const prefs = await preferencesService.getPreferences();
      setPreferences(prefs);
      
      // Store preferences in local storage for offline access
      await AsyncStorage.setItem('@user_preferences', JSON.stringify(prefs));
      
      return prefs;
    } catch (error) {
      console.error('Error loading preferences:', error);
      // Try to get from local storage as fallback
      try {
        const cached = await AsyncStorage.getItem('@user_preferences');
        if (cached) {
          setPreferences(JSON.parse(cached));
          return JSON.parse(cached);
        }
      } catch (cacheError) {
        console.error('Error reading cached preferences:', cacheError);
      }
      throw error;
    }
  };

  const updatePreferences = async (key, value) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      const result = await preferencesService.updatePreference(key, value);
      
      // Update local preferences state
      if (key.startsWith('notification_')) {
        const notifKey = key.replace('notification_', '');
        setPreferences({
          ...preferences,
          notifications: {
            ...preferences.notifications,
            [notifKey]: value
          }
        });
      } else {
        setPreferences({
          ...preferences,
          [key]: value
        });
      }
      
      // Save updated preferences to storage
      const updatedPrefs = {
        ...preferences,
        [key]: value
      };
      await AsyncStorage.setItem('@user_preferences', JSON.stringify(updatedPrefs));
      
      return result;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error.response?.data?.error || error.message || 'Failed to update preference';
    }
  };

  const updateNotifications = async (notificationSettings) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      const result = await preferencesService.updateNotifications(notificationSettings);
      
      // Update local preferences state
      setPreferences({
        ...preferences,
        notifications: result
      });
      
      // Save updated preferences to storage
      const updatedPrefs = {
        ...preferences,
        notifications: result
      };
      await AsyncStorage.setItem('@user_preferences', JSON.stringify(updatedPrefs));
      
      return result;
    } catch (error) {
      console.error('Error updating notifications:', error);
      throw error.response?.data?.error || error.message || 'Failed to update notifications';
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      authToken, 
      loading, 
      preferences,
      signIn,
      signUp,
      completeProfile,
      signOut,
      resetPassword,
      updateUserProfile,
      changePassword,
      updateProfile,
      loadPreferences,
      updatePreferences,
      updateNotifications,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
