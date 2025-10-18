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

    // Handle both string and ObjectId formats
    let query;
    try {
      query = { userId: new ObjectId(userId) };
    } catch {
      query = { userId: userId };
    }

    const preferences = await collection.findOne(query);

    if (!preferences) {
      throw new Error('Preferences not found for this user');
    }

    return {
      userId: preferences.userId.toString ? preferences.userId.toString() : preferences.userId,
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

    // Handle both string and ObjectId formats
    let userIdToStore;
    try {
      userIdToStore = new ObjectId(userId);
    } catch {
      userIdToStore = userId;
    }

    // Use updateOne with upsert to avoid duplicate key error
    // If preferences exist, do nothing. If not, create them.
    const result = await collection.updateOne(
      { userId: userIdToStore },
      {
        $setOnInsert: {
          userId: userIdToStore,
          ...DEFAULT_PREFERENCES,
          createdAt: now,
          updatedAt: now,
          version: 1
        }
      },
      { upsert: true }
    );

    if (result.upsertedId) {
      console.log(`✅ Default preferences created for user: ${userId}`);
    } else if (result.matchedCount > 0) {
      console.log(`✅ Preferences already exist for user: ${userId}`);
    }

    // Return the preferences
    const prefs = await collection.findOne({ userId: userIdToStore });
    
    return {
      _id: prefs._id.toString(),
      userId: userId,
      ...prefs
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

    // Handle both string and ObjectId formats
    let query;
    try {
      query = { userId: new ObjectId(userId) };
    } catch {
      query = { userId: userId };
    }

    // Use updateOne for reliability, then fetch the result
    const updateResult = await collection.updateOne(query, updateObj);

    if (updateResult.matchedCount === 0) {
      throw new Error('User preferences not found');
    }
    
    // Fetch the updated document
    const updatedPrefs = await collection.findOne(query);

    if (!updatedPrefs) {
      throw new Error('Failed to retrieve updated preferences');
    }

    console.log(`✅ Preference ${preferenceKey} updated for user: ${userId}`);

    return updatedPrefs;
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

    // Handle both string and ObjectId formats
    let query;
    try {
      query = { userId: new ObjectId(userId) };
    } catch {
      query = { userId: userId };
    }

    // Use updateOne for reliability, then fetch the result
    const updateResult = await collection.updateOne(
      query,
      {
        $set: {
          notifications: notificationSettings,
          updatedAt: now
        }
      }
    );

    if (updateResult.matchedCount === 0) {
      throw new Error('User preferences not found');
    }

    // Fetch the updated document
    const updatedPrefs = await collection.findOne(query);

    if (!updatedPrefs) {
      throw new Error('Failed to retrieve updated preferences');
    }

    console.log(`✅ Notifications updated for user: ${userId}`);

    return updatedPrefs;
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
