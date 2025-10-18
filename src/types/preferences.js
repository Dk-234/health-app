/**
 * Type Definitions for Preferences System
 * Note: This project uses JavaScript, but these comments define the expected types
 * for better code documentation and IDE support
 */

/**
 * @typedef {Object} NotificationSettings
 * @property {boolean} inAppAlerts - Show in-app alerts
 * @property {boolean} emailNotifications - Send email notifications
 * @property {boolean} pushNotifications - Send push notifications
 * @property {boolean} weeklyDigest - Send weekly digest emails
 * @property {boolean} marketingEmails - Send marketing communications
 * @property {boolean} communityUpdates - Send community updates
 */

/**
 * @typedef {Object} UserPreferences
 * @property {string} _id - Preference document ID (MongoDB ObjectId)
 * @property {string} userId - Associated user ID
 * @property {boolean} dataSharing - Whether to share anonymized data
 * @property {boolean} analyticsEnabled - Whether analytics are enabled
 * @property {boolean} thirdPartyIntegration - Whether third-party integration is enabled
 * @property {NotificationSettings} notifications - Notification preferences
 * @property {string} createdAt - Preference creation timestamp (ISO 8601)
 * @property {string} updatedAt - Last update timestamp (ISO 8601)
 * @property {number} version - Preference schema version
 */

/**
 * @typedef {Object} PreferenceUpdateRequest
 * @property {boolean} value - New preference value
 */

/**
 * @typedef {Object} PasswordChangeRequest
 * @property {string} currentPassword - Current user password
 * @property {string} newPassword - New password (8+ chars, uppercase, lowercase, number, special char)
 * @property {string} confirmPassword - Password confirmation
 */

/**
 * @typedef {Object} ProfileUpdateRequest
 * @property {string} [name] - User name (2-50 chars)
 * @property {number} [age] - User age (13-120)
 * @property {string} [phone] - User phone number (10+ digits)
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} uid - User ID
 * @property {string} email - User email
 * @property {string} name - User name
 * @property {number} age - User age
 * @property {string} phone - User phone
 * @property {string} avatar - User avatar emoji or URL
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Operation success status
 * @property {string} [message] - Success or error message
 * @property {*} [data] - Response data
 * @property {string} [error] - Error description
 * @property {string} [code] - Error code (e.g., 'TOKEN_EXPIRED', 'INVALID_PASSWORD')
 */

/**
 * @typedef {Object} AuthContextType
 * @property {UserProfile|null} user - Current authenticated user
 * @property {UserPreferences|null} preferences - User preferences
 * @property {boolean} isLoading - Loading state
 * @property {Function} signIn - Sign in user
 * @property {Function} signUp - Sign up new user
 * @property {Function} signOut - Sign out current user
 * @property {Function} changePassword - Change user password
 * @property {Function} updateProfile - Update user profile
 * @property {Function} updatePreferences - Update user preferences
 * @property {Function} loadPreferences - Load user preferences
 */

// Export empty object for import statement compatibility
export const preferenceTypes = {
  NotificationSettings: 'NotificationSettings',
  UserPreferences: 'UserPreferences',
  PreferenceUpdateRequest: 'PreferenceUpdateRequest',
  PasswordChangeRequest: 'PasswordChangeRequest',
  ProfileUpdateRequest: 'ProfileUpdateRequest',
  UserProfile: 'UserProfile',
  ApiResponse: 'ApiResponse',
  AuthContextType: 'AuthContextType',
};

// Default preferences structure
export const DEFAULT_PREFERENCES = {
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
};

// Notification keys for validation
export const NOTIFICATION_KEYS = [
  'inAppAlerts',
  'emailNotifications',
  'pushNotifications',
  'weeklyDigest',
  'marketingEmails',
  'communityUpdates',
];

// Privacy setting keys for validation
export const PRIVACY_KEYS = [
  'dataSharing',
  'analyticsEnabled',
  'thirdPartyIntegration',
];

// All preference keys
export const ALL_PREFERENCE_KEYS = [
  ...PRIVACY_KEYS,
  'notifications',
];

// Password strength requirements
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '@$!%*?&',
  regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

// Profile validation rules
export const PROFILE_VALIDATION = {
  name: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/,
    message: 'Name must be 2-50 characters with letters and spaces only'
  },
  age: {
    min: 13,
    max: 120,
    message: 'Age must be between 13 and 120'
  },
  phone: {
    minDigits: 10,
    pattern: /^\d{10,}$/,
    message: 'Phone must contain at least 10 digits'
  }
};

// API error codes
export const ERROR_CODES = {
  INVALID_INPUT: 'INVALID_INPUT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  SERVER_ERROR: 'SERVER_ERROR',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  WEAK_PASSWORD: 'WEAK_PASSWORD',
  NETWORK_ERROR: 'NETWORK_ERROR',
};

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};
