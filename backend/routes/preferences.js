// Preferences Routes
// Handles all preference-related API endpoints

const express = require('express');
const router = express.Router();
const { verifyToken, authorizeUser } = require('../middleware/auth');
const {
  getPreferences,
  createDefaultPreferences,
  updatePreference,
  updateNotifications
} = require('../models/Preference');

// Middleware - Apply JWT verification to all routes in this file
router.use(verifyToken);

/**
 * GET /api/auth/preferences
 * Get all user preferences
 * Requires: Valid JWT token
 */
router.get('/preferences', async (req, res) => {
  try {
    const userId = req.user.userId;

    console.log(`📥 GET /preferences for user: ${userId}`);

    const preferences = await getPreferences(userId);

    res.json({
      success: true,
      message: 'Preferences retrieved successfully',
      data: preferences
    });
  } catch (error) {
    console.error('❌ Error fetching preferences:', error);

    if (error.message.includes('Preferences not found')) {
      return res.status(404).json({
        success: false,
        error: 'Preferences not found. Please initialize preferences first.',
        code: 'PREFERENCES_NOT_FOUND'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch preferences'
    });
  }
});

/**
 * POST /api/auth/preferences/init
 * Initialize default preferences for new user
 * Requires: Valid JWT token
 */
router.post('/preferences/init', async (req, res) => {
  try {
    const userId = req.user.userId;

    console.log(`📥 POST /preferences/init for user: ${userId}`);

    // Check if preferences already exist
    try {
      await getPreferences(userId);
      return res.status(409).json({
        success: false,
        error: 'Preferences already exist for this user',
        code: 'PREFERENCES_ALREADY_EXIST'
      });
    } catch {
      // Preferences don't exist yet, proceed with creation
    }

    const preferences = await createDefaultPreferences(userId);

    res.status(201).json({
      success: true,
      message: 'Preferences initialized successfully',
      data: preferences
    });
  } catch (error) {
    console.error('❌ Error initializing preferences:', error);

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to initialize preferences'
    });
  }
});

/**
 * PUT /api/auth/preferences/:key
 * Update specific preference value
 * Requires: Valid JWT token
 * Body: { value: any }
 */
router.put('/preferences/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const userId = req.user.userId;

    console.log(`📥 PUT /preferences/${key} for user: ${userId}, value: ${value}`);

    // Validate input
    if (value === undefined || value === null) {
      return res.status(400).json({
        success: false,
        error: 'Value is required',
        code: 'MISSING_VALUE'
      });
    }

    // Allowed preference keys - include both top-level and notification keys
    const allowedKeys = [
      'dataSharing',
      'analyticsEnabled',
      'thirdPartyIntegration',
      'inAppAlerts',           // notification keys
      'emailNotifications',
      'pushNotifications',
      'weeklyDigest',
      'marketingEmails',
      'communityUpdates'
    ];

    if (!allowedKeys.includes(key)) {
      return res.status(400).json({
        success: false,
        error: `Invalid preference key: ${key}. Allowed keys: ${allowedKeys.join(', ')}`,
        code: 'INVALID_KEY'
      });
    }

    // Validate that value is boolean for these keys
    if (typeof value !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: `Value for ${key} must be a boolean`,
        code: 'INVALID_VALUE_TYPE'
      });
    }

    // If updating a notification key, handle it specially
    const notificationKeys = ['inAppAlerts', 'emailNotifications', 'pushNotifications', 'weeklyDigest', 'marketingEmails', 'communityUpdates'];
    let updatedPrefs;
    
    if (notificationKeys.includes(key)) {
      // Update notification preference
      const notifications = {};
      notifications[key] = value;
      updatedPrefs = await updateNotifications(userId, notifications);
    } else {
      // Update top-level preference
      updatedPrefs = await updatePreference(userId, key, value);
    }

    res.json({
      success: true,
      message: `Preference ${key} updated successfully`,
      data: {
        key,
        value: updatedPrefs[key],
        updatedAt: updatedPrefs.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Error updating preference:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: 'User preferences not found. Please initialize preferences first.',
        code: 'PREFERENCES_NOT_FOUND'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update preference'
    });
  }
});

/**
 * DELETE /api/auth/preferences/:key
 * Reset specific preference to default value
 * Requires: Valid JWT token
 */
router.delete('/preferences/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const userId = req.user.userId;

    console.log(`📥 DELETE /preferences/${key} for user: ${userId}`);

    // Get default value for the key
    const { DEFAULT_PREFERENCES } = require('../models/Preference');
    
    if (!DEFAULT_PREFERENCES.hasOwnProperty(key)) {
      return res.status(400).json({
        success: false,
        error: `Invalid preference key: ${key}`,
        code: 'INVALID_KEY'
      });
    }

    const defaultValue = DEFAULT_PREFERENCES[key];

    const updatedPrefs = await updatePreference(userId, key, defaultValue);

    res.json({
      success: true,
      message: `Preference ${key} reset to default`,
      data: {
        key,
        value: updatedPrefs[key],
        updatedAt: updatedPrefs.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Error resetting preference:', error);

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to reset preference'
    });
  }
});

/**
 * GET /api/auth/preferences/notifications
 * Get notification settings
 * Requires: Valid JWT token
 */
router.get('/preferences/notifications', async (req, res) => {
  try {
    const userId = req.user.userId;

    console.log(`📥 GET /preferences/notifications for user: ${userId}`);

    const preferences = await getPreferences(userId);

    res.json({
      success: true,
      message: 'Notification settings retrieved successfully',
      data: preferences.notifications
    });
  } catch (error) {
    console.error('❌ Error fetching notification settings:', error);

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch notification settings'
    });
  }
});

/**
 * PUT /api/auth/preferences/notifications
 * Update notification settings
 * Requires: Valid JWT token
 * Body: { email, push, sms, dailyReminders, weeklyDigest, urgentOnly }
 */
router.put('/preferences/notifications', async (req, res) => {
  try {
    const userId = req.user.userId;
    const notificationSettings = req.body;

    console.log(`📥 PUT /preferences/notifications for user: ${userId}`);

    // Validate notification settings
    const allowedSettings = [
      'email',
      'push',
      'sms',
      'dailyReminders',
      'weeklyDigest',
      'urgentOnly'
    ];

    for (const [key, value] of Object.entries(notificationSettings)) {
      if (!allowedSettings.includes(key)) {
        return res.status(400).json({
          success: false,
          error: `Invalid notification setting: ${key}`,
          code: 'INVALID_SETTING'
        });
      }

      if (typeof value !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: `Notification setting ${key} must be a boolean`,
          code: 'INVALID_VALUE_TYPE'
        });
      }
    }

    const updatedPrefs = await updateNotifications(userId, notificationSettings);

    res.json({
      success: true,
      message: 'Notification settings updated successfully',
      data: updatedPrefs.notifications
    });
  } catch (error) {
    console.error('❌ Error updating notification settings:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: 'User preferences not found. Please initialize preferences first.',
        code: 'PREFERENCES_NOT_FOUND'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update notification settings'
    });
  }
});

module.exports = router;
