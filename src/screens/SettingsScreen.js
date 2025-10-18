import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { 
  Card, 
  Button, 
  Switch, 
  TextInput, 
  Dialog,
  Portal,
  Divider,
  Snackbar,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

const SettingsScreen = ({ navigation }) => {
  const { user, signOut, updatePreferences, changePassword, updateProfile } = useAuth();
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Preferences state
  const [preferences, setPreferences] = useState({
    dataSharing: false,
    analyticsEnabled: true,
    thirdPartyIntegration: false,
    notifications: {
      inAppAlerts: true,
      emailNotifications: false,
      pushNotifications: true,
      weeklyDigest: false,
      marketingEmails: false,
      communityUpdates: true,
    }
  });

  // Profile edit state
  const [editProfileMode, setEditProfileMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    age: user?.age?.toString() || '',
    phone: user?.phone || '',
  });

  // Change password state
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'success', // success, error, info
  });

  // Dialog state for logout confirmation
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setRefreshing(true);
      // This will be implemented in AuthContext
      // For now, preferences are in state
      setRefreshing(false);
    } catch (error) {
      showSnackbar('Error loading preferences', 'error');
      setRefreshing(false);
    }
  };

  const handlePreferenceToggle = async (key, value) => {
    try {
      setLoading(true);
      
      // Update local state
      if (key.startsWith('notification_')) {
        const notifKey = key.replace('notification_', '');
        setPreferences({
          ...preferences,
          notifications: {
            ...preferences.notifications,
            [notifKey]: value,
          }
        });
      } else {
        setPreferences({
          ...preferences,
          [key]: value,
        });
      }
      
      // Call API (to be implemented in AuthContext)
      showSnackbar(`${key} updated successfully`, 'success');
    } catch (error) {
      showSnackbar('Error updating preference', 'error');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileEdit = async () => {
    try {
      if (!profileData.name.trim() || profileData.name.length < 2) {
        showSnackbar('Name must be at least 2 characters', 'error');
        return;
      }

      if (profileData.age && (parseInt(profileData.age) < 13 || parseInt(profileData.age) > 120)) {
        showSnackbar('Age must be between 13 and 120', 'error');
        return;
      }

      if (profileData.phone && profileData.phone.replace(/\D/g, '').length < 10) {
        showSnackbar('Phone must contain at least 10 digits', 'error');
        return;
      }

      setLoading(true);

      // Call updateProfile from AuthContext
      await updateProfile({
        name: profileData.name,
        age: profileData.age ? parseInt(profileData.age) : undefined,
        phone: profileData.phone || undefined,
      });

      showSnackbar('Profile updated successfully', 'success');
      setEditProfileMode(false);
      setLoading(false);
    } catch (error) {
      showSnackbar(error.message || 'Error updating profile', 'error');
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!passwordData.currentPassword) {
        showSnackbar('Current password is required', 'error');
        return;
      }

      if (!passwordData.newPassword || passwordData.newPassword.length < 8) {
        showSnackbar('New password must be at least 8 characters', 'error');
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        showSnackbar('Passwords do not match', 'error');
        return;
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(passwordData.newPassword)) {
        showSnackbar('Password must contain uppercase, lowercase, number, and special character', 'error');
        return;
      }

      setLoading(true);

      // Call changePassword from AuthContext
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

      showSnackbar('Password changed successfully', 'success');
      setPasswordModalVisible(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setLoading(false);
    } catch (error) {
      showSnackbar(error.message || 'Error changing password', 'error');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut();
      setLoading(false);
    } catch (error) {
      showSnackbar('Error logging out', 'error');
      setLoading(false);
    }
  };

  const showSnackbar = (message, type = 'success') => {
    setSnackbar({
      visible: true,
      message,
      type,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadPreferences} />
        }
      >
        {/* USER INFO SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.userInfoContainer}>
                <View style={styles.userAvatarContainer}>
                  <Text style={styles.userAvatar}>{user?.avatar || '👤'}</Text>
                </View>
                <View style={styles.userDetailsContainer}>
                  <Text style={styles.userName}>{user?.name || 'User'}</Text>
                  <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* PROFILE SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          {!editProfileMode ? (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Name</Text>
                  <Text style={styles.infoValue}>{profileData.name || 'Not set'}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Age</Text>
                  <Text style={styles.infoValue}>{profileData.age || 'Not set'}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{profileData.phone || 'Not set'}</Text>
                </View>
              </Card.Content>
              <Card.Actions>
                <Button 
                  mode="outlined"
                  onPress={() => setEditProfileMode(true)}
                  style={styles.actionButton}
                >
                  Edit Profile
                </Button>
              </Card.Actions>
            </Card>
          ) : (
            <Card style={styles.card}>
              <Card.Content>
                <TextInput
                  label="Name"
                  value={profileData.name}
                  onChangeText={(text) => setProfileData({ ...profileData, name: text })}
                  mode="outlined"
                  style={styles.input}
                />
                <TextInput
                  label="Age"
                  value={profileData.age}
                  onChangeText={(text) => setProfileData({ ...profileData, age: text })}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                />
                <TextInput
                  label="Phone"
                  value={profileData.phone}
                  onChangeText={(text) => setProfileData({ ...profileData, phone: text })}
                  mode="outlined"
                  keyboardType="phone-pad"
                  style={styles.input}
                />
              </Card.Content>
              <Card.Actions style={styles.cardActions}>
                <Button 
                  mode="outlined"
                  onPress={() => {
                    setEditProfileMode(false);
                    setProfileData({
                      name: user?.name || '',
                      age: user?.age?.toString() || '',
                      phone: user?.phone || '',
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  mode="contained"
                  onPress={handleProfileEdit}
                  loading={loading}
                  disabled={loading}
                >
                  Save
                </Button>
              </Card.Actions>
            </Card>
          )}
        </View>

        {/* PRIVACY SETTINGS SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.toggleRow}>
                <View style={styles.toggleLabel}>
                  <Text style={styles.toggleTitle}>Data Sharing</Text>
                  <Text style={styles.toggleDescription}>
                    Allow us to share anonymized data for research
                  </Text>
                </View>
                <Switch
                  value={preferences.dataSharing}
                  onValueChange={(value) => 
                    handlePreferenceToggle('dataSharing', value)
                  }
                  disabled={loading}
                />
              </View>
              <Divider style={styles.divider} />

              <View style={styles.toggleRow}>
                <View style={styles.toggleLabel}>
                  <Text style={styles.toggleTitle}>Analytics</Text>
                  <Text style={styles.toggleDescription}>
                    Help us improve the app by sharing usage analytics
                  </Text>
                </View>
                <Switch
                  value={preferences.analyticsEnabled}
                  onValueChange={(value) => 
                    handlePreferenceToggle('analyticsEnabled', value)
                  }
                  disabled={loading}
                />
              </View>
              <Divider style={styles.divider} />

              <View style={styles.toggleRow}>
                <View style={styles.toggleLabel}>
                  <Text style={styles.toggleTitle}>Third-party Integration</Text>
                  <Text style={styles.toggleDescription}>
                    Connect with other health apps and devices
                  </Text>
                </View>
                <Switch
                  value={preferences.thirdPartyIntegration}
                  onValueChange={(value) => 
                    handlePreferenceToggle('thirdPartyIntegration', value)
                  }
                  disabled={loading}
                />
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* NOTIFICATION SETTINGS SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.toggleRow}>
                <View style={styles.toggleLabel}>
                  <Text style={styles.toggleTitle}>In-App Alerts</Text>
                  <Text style={styles.toggleDescription}>
                    Get alerts while using the app
                  </Text>
                </View>
                <Switch
                  value={preferences.notifications.inAppAlerts}
                  onValueChange={(value) => 
                    handlePreferenceToggle('notification_inAppAlerts', value)
                  }
                  disabled={loading}
                />
              </View>
              <Divider style={styles.divider} />

              <View style={styles.toggleRow}>
                <View style={styles.toggleLabel}>
                  <Text style={styles.toggleTitle}>Email Notifications</Text>
                  <Text style={styles.toggleDescription}>
                    Receive email updates about your health
                  </Text>
                </View>
                <Switch
                  value={preferences.notifications.emailNotifications}
                  onValueChange={(value) => 
                    handlePreferenceToggle('notification_emailNotifications', value)
                  }
                  disabled={loading}
                />
              </View>
              <Divider style={styles.divider} />

              <View style={styles.toggleRow}>
                <View style={styles.toggleLabel}>
                  <Text style={styles.toggleTitle}>Push Notifications</Text>
                  <Text style={styles.toggleDescription}>
                    Receive push notifications on your device
                  </Text>
                </View>
                <Switch
                  value={preferences.notifications.pushNotifications}
                  onValueChange={(value) => 
                    handlePreferenceToggle('notification_pushNotifications', value)
                  }
                  disabled={loading}
                />
              </View>
              <Divider style={styles.divider} />

              <View style={styles.toggleRow}>
                <View style={styles.toggleLabel}>
                  <Text style={styles.toggleTitle}>Weekly Digest</Text>
                  <Text style={styles.toggleDescription}>
                    Get a weekly summary of your health data
                  </Text>
                </View>
                <Switch
                  value={preferences.notifications.weeklyDigest}
                  onValueChange={(value) => 
                    handlePreferenceToggle('notification_weeklyDigest', value)
                  }
                  disabled={loading}
                />
              </View>
              <Divider style={styles.divider} />

              <View style={styles.toggleRow}>
                <View style={styles.toggleLabel}>
                  <Text style={styles.toggleTitle}>Marketing Emails</Text>
                  <Text style={styles.toggleDescription}>
                    Receive updates about new features and promotions
                  </Text>
                </View>
                <Switch
                  value={preferences.notifications.marketingEmails}
                  onValueChange={(value) => 
                    handlePreferenceToggle('notification_marketingEmails', value)
                  }
                  disabled={loading}
                />
              </View>
              <Divider style={styles.divider} />

              <View style={styles.toggleRow}>
                <View style={styles.toggleLabel}>
                  <Text style={styles.toggleTitle}>Community Updates</Text>
                  <Text style={styles.toggleDescription}>
                    Get updates about community challenges and events
                  </Text>
                </View>
                <Switch
                  value={preferences.notifications.communityUpdates}
                  onValueChange={(value) => 
                    handlePreferenceToggle('notification_communityUpdates', value)
                  }
                  disabled={loading}
                />
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* ACCOUNT ACTIONS SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          <Card style={styles.card}>
            <Card.Content>
              <Button
                mode="outlined"
                onPress={() => setPasswordModalVisible(true)}
                style={styles.actionButton}
                disabled={loading}
              >
                Change Password
              </Button>
              <Button
                mode="contained-tonal"
                onPress={() => setLogoutDialogVisible(true)}
                style={styles.actionButton}
                disabled={loading}
              >
                Logout
              </Button>
            </Card.Content>
          </Card>
        </View>

        {/* SPACER */}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* CHANGE PASSWORD MODAL */}
      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity 
                onPress={() => setPasswordModalVisible(false)}
                disabled={loading}
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <TextInput
                label="Current Password"
                value={passwordData.currentPassword}
                onChangeText={(text) => 
                  setPasswordData({ ...passwordData, currentPassword: text })
                }
                secureTextEntry={!showPasswords.current}
                mode="outlined"
                style={styles.input}
                right={
                  <TextInput.Icon
                    icon={showPasswords.current ? 'eye' : 'eye-off'}
                    onPress={() => 
                      setShowPasswords({
                        ...showPasswords,
                        current: !showPasswords.current
                      })
                    }
                  />
                }
              />

              <TextInput
                label="New Password"
                value={passwordData.newPassword}
                onChangeText={(text) => 
                  setPasswordData({ ...passwordData, newPassword: text })
                }
                secureTextEntry={!showPasswords.new}
                mode="outlined"
                style={styles.input}
                right={
                  <TextInput.Icon
                    icon={showPasswords.new ? 'eye' : 'eye-off'}
                    onPress={() => 
                      setShowPasswords({
                        ...showPasswords,
                        new: !showPasswords.new
                      })
                    }
                  />
                }
              />
              <Text style={styles.passwordHint}>
                Password must be 8+ characters with uppercase, lowercase, number, and special character
              </Text>

              <TextInput
                label="Confirm Password"
                value={passwordData.confirmPassword}
                onChangeText={(text) => 
                  setPasswordData({ ...passwordData, confirmPassword: text })
                }
                secureTextEntry={!showPasswords.confirm}
                mode="outlined"
                style={styles.input}
                right={
                  <TextInput.Icon
                    icon={showPasswords.confirm ? 'eye' : 'eye-off'}
                    onPress={() => 
                      setShowPasswords({
                        ...showPasswords,
                        confirm: !showPasswords.confirm
                      })
                    }
                  />
                }
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                mode="outlined"
                onPress={() => setPasswordModalVisible(false)}
                disabled={loading}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleChangePassword}
                loading={loading}
                disabled={loading}
                style={styles.modalButton}
              >
                Update Password
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* LOGOUT CONFIRMATION DIALOG */}
      <Portal>
        <Dialog visible={logoutDialogVisible} onDismiss={() => setLogoutDialogVisible(false)}>
          <Dialog.Title>Confirm Logout</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to logout?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogoutDialogVisible(false)}>
              Cancel
            </Button>
            <Button 
              onPress={() => {
                setLogoutDialogVisible(false);
                handleLogout();
              }}
              loading={loading}
              disabled={loading}
            >
              Logout
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* SNACKBAR */}
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3000}
        style={[
          styles.snackbar,
          snackbar.type === 'error' && styles.snackbarError,
          snackbar.type === 'info' && styles.snackbarInfo,
        ]}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  card: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  cardActions: {
    justifyContent: 'flex-end',
    padding: 16,
  },

  // User Info Styles
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userAvatar: {
    fontSize: 32,
  },
  userDetailsContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },

  // Profile Info Styles
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
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
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  actionButton: {
    marginVertical: 6,
  },

  // Input Styles
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },

  // Toggle Styles
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleLabel: {
    flex: 1,
    marginRight: 12,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 12,
    color: '#999',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
    padding: 8,
  },
  modalBody: {
    padding: 16,
  },
  passwordHint: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 6,
  },

  // Snackbar Styles
  snackbar: {
    backgroundColor: '#4CAF50',
  },
  snackbarError: {
    backgroundColor: '#F44336',
  },
  snackbarInfo: {
    backgroundColor: '#2196F3',
  },
});

export default SettingsScreen;
