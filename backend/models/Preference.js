// Preferences Model and Schema Definition
// Stores user preference settings in MongoDB

const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// Default preferences for new users
const DEFAULT_PREFERENCES = {
  dataSharing: false,
  analyticsEnabled: true,
  thirdPartyIntegration: false,
  notifications: {
    email: true,
    push: true,
    sms: false,
    dailyReminders: true,
    weeklyDigest: true,
    urgentOnly: false
  }
};

// Preferences Collection Name
const PREFERENCES_COLLECTION = 'preferences';

// Create Preferences Schema/Indexes
const initializePreferencesCollection = async () => {
  try {
    const db = getDB();
    const collection = db.collection(PREFERENCES_COLLECTION);

    // Create unique index on userId (one preferences per user)
    await collection.createIndex({ userId: 1 }, { unique: true });

    // Create index on updatedAt for querying recent changes
    await collection.createIndex({ updatedAt: 1 });

    console.log('✅ Preferences collection initialized with indexes');
  } catch (error) {
    console.error('❌ Error initializing preferences collection:', error);
    throw error;
  }
};

// Get preferences for a user
const getPreferences = async (userId) => {
  try {
    const db = getDB();
    const collection = db.collection(PREFERENCES_COLLECTION);

    const preferences = await collection.findOne({
      userId: new ObjectId(userId)
    });

    if (!preferences) {
      throw new Error('Preferences not found for this user');
    }

    return {
      userId: preferences.userId.toString(),
      dataSharing: preferences.dataSharing,
      analyticsEnabled: preferences.analyticsEnabled,
      thirdPartyIntegration: preferences.thirdPartyIntegration,
      notifications: preferences.notifications,
      createdAt: preferences.createdAt,
      updatedAt: preferences.updatedAt
    };
  } catch (error) {
    console.error('Error fetching preferences:', error);
    throw error;
  }
};

// Create default preferences for new user
const createDefaultPreferences = async (userId) => {
  try {
    const db = getDB();
    const collection = db.collection(PREFERENCES_COLLECTION);

    const now = new Date().toISOString();

    const result = await collection.insertOne({
      userId: new ObjectId(userId),
      ...DEFAULT_PREFERENCES,
      createdAt: now,
      updatedAt: now,
      version: 1
    });

    console.log(`✅ Default preferences created for user: ${userId}`);

    return {
      _id: result.insertedId.toString(),
      userId: userId,
      ...DEFAULT_PREFERENCES,
      createdAt: now,
      updatedAt: now
    };
  } catch (error) {
    console.error('Error creating default preferences:', error);
    throw error;
  }
};

// Update specific preference
const updatePreference = async (userId, preferenceKey, value) => {
  try {
    const db = getDB();
    const collection = db.collection(PREFERENCES_COLLECTION);
    const now = new Date().toISOString();

    // Build update object based on preference key
    const updateObj = {
      $set: {
        [`${preferenceKey}`]: value,
        updatedAt: now
      }
    };

    // For nested keys like notifications.email
    if (preferenceKey.includes('.')) {
      updateObj.$set[preferenceKey] = value;
    }

    const result = await collection.findOneAndUpdate(
      { userId: new ObjectId(userId) },
      updateObj,
      { returnDocument: 'after' }
    );

    if (!result.value) {
      throw new Error('User preferences not found');
    }

    console.log(`✅ Preference ${preferenceKey} updated for user: ${userId}`);

    return result.value;
  } catch (error) {
    console.error('Error updating preference:', error);
    throw error;
  }
};

// Update notification settings
const updateNotifications = async (userId, notificationSettings) => {
  try {
    const db = getDB();
    const collection = db.collection(PREFERENCES_COLLECTION);
    const now = new Date().toISOString();

    const result = await collection.findOneAndUpdate(
      { userId: new ObjectId(userId) },
      {
        $set: {
          notifications: notificationSettings,
          updatedAt: now
        }
      },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      throw new Error('User preferences not found');
    }

    console.log(`✅ Notifications updated for user: ${userId}`);

    return result.value;
  } catch (error) {
    console.error('Error updating notifications:', error);
    throw error;
  }
};

// Initialize preferences collection on app startup
module.exports = {
  DEFAULT_PREFERENCES,
  PREFERENCES_COLLECTION,
  initializePreferencesCollection,
  getPreferences,
  createDefaultPreferences,
  updatePreference,
  updateNotifications
};
