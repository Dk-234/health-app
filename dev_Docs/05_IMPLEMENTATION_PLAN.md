# Implementation Plan - Settings Management System

**Start Time**: October 18, 2025, ~1:00 PM  
**Deadline**: 7:00 PM (6 hours)  
**Scope**: MVP (Minimum Viable Product) - Focus on core functionality

---

## 🎯 Phase 1: Backend Setup (1.5-2 hours)

### Step 1.1: Create Authentication Middleware ⏱️ 30 mins

**File**: `backend/middleware/auth.js`

**Requirements**:
- Verify JWT tokens
- Extract userId from token
- Add user to request object
- Handle token expiration
- Return 401 for invalid tokens

**Action**:
```bash
# Will create file with proper structure
```

### Step 1.2: Create Preferences Database Schema ⏱️ 30 mins

**File**: `backend/config/db.js` (extend) or `backend/models/Preference.js`

**Requirements**:
- Create MongoDB collection for preferences
- Define schema with proper validation
- Add indexes for userId and timestamps
- Set up default values

**Fields**:
```javascript
{
  userId: ObjectId,           // Reference to user
  dataSharing: boolean,       // Default: false
  analyticsEnabled: boolean,  // Default: true
  thirdPartyIntegration: boolean, // Default: false
  notifications: {
    email: boolean,          // Default: true
    push: boolean,           // Default: true
    sms: boolean,            // Default: false
    dailyReminders: boolean, // Default: true
    weeklyDigest: boolean,   // Default: true
    urgentOnly: boolean      // Default: false
  },
  createdAt: Date,
  updatedAt: Date,
  version: number            // For conflict resolution
}
```

### Step 1.3: Create Preferences API Routes ⏱️ 45 mins

**File**: `backend/routes/preferences.js`

**Endpoints to Implement**:

1. **GET /api/auth/preferences**
   - Get all user preferences
   - Requires authentication
   - Return user's complete preference object

2. **POST /api/auth/preferences/init**
   - Initialize default preferences for new user
   - Called after profile setup
   - Set all defaults
   - Return created preferences

3. **PUT /api/auth/preferences/:key**
   - Update specific preference
   - Validate key exists
   - Store in audit log
   - Return updated value

4. **PUT /api/auth/preferences/notifications**
   - Update all notification settings
   - Accept partial updates
   - Merge with existing
   - Return updated notifications

### Step 1.4: Add JWT Token Generation ⏱️ 30 mins

**Update File**: `backend/routes/auth.js`

**Requirements**:
- Generate JWT on successful login
- Add JWT to login response
- Include userId and email in payload
- Set 24-hour expiration

**Action**:
```bash
# Need to install: npm install jsonwebtoken
# Or add: npm install jsonwebtoken (in package.json devDependencies)
```

### Step 1.5: Add Password Change Endpoint ⏱️ 30 mins

**Update File**: `backend/routes/auth.js`

**Endpoint**: `POST /api/auth/change-password`

**Requirements**:
- Verify current password
- Validate new password strength
- Hash new password
- Update in database
- Return success message

**Request Body**:
```javascript
{
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
}
```

### Step 1.6: Add Profile Update Endpoint ⏱️ 20 mins

**Update File**: `backend/routes/auth.js`

**Endpoint**: `PATCH /api/auth/profile`

**Requirements**:
- Update name, age, phone
- Validate all fields
- Only allow authenticated users to update own profile
- Return updated profile

**Request Body**:
```javascript
{
  name: string (optional),
  age: number (optional),
  phone: string (optional)
}
```

---

## 🎯 Phase 2: Frontend - Settings Screen UI (1-1.5 hours)

### Step 2.1: Create Main Settings Screen ⏱️ 45 mins

**File**: `src/screens/SettingsScreen.js`

**Requirements**:
- ScrollView with all sections
- Pull-to-refresh to reload
- Loading state while fetching
- Error state with retry
- Sections:
  1. Profile Information
  2. Privacy Settings
  3. Notification Settings
  4. Account Actions (Password & Logout)

**Basic Structure**:
```javascript
import React, { useState, useEffect } from 'react';
import { ScrollView, View, ActivityIndicator } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';

export default function SettingsScreen({ navigation }) {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    // Fetch from API
  };

  return (
    <ScrollView>
      {/* Sections here */}
    </ScrollView>
  );
}
```

### Step 2.2: Create Profile Edit Section ⏱️ 20 mins

**Component Structure**:
- Display current name, age, phone
- Edit mode toggle
- Input fields when in edit mode
- Save/Cancel buttons
- Show loading spinner during save
- Display validation errors

### Step 2.3: Create Privacy Settings Section ⏱️ 15 mins

**Component Structure**:
- Three toggle switches:
  - Data Sharing
  - Analytics Enabled
  - Third Party Integration
- Auto-save on toggle
- Show loading state during save

### Step 2.4: Create Notification Settings Section ⏱️ 15 mins

**Component Structure**:
- Six toggle switches:
  - Email Notifications
  - Push Notifications
  - SMS Notifications
  - Daily Reminders
  - Weekly Digest
  - Urgent Only Mode
- Auto-save on toggle

### Step 2.5: Create Account Actions Section ⏱️ 15 mins

**Component Structure**:
- Change Password button
- Modal for password change form
- Fields: Current password, new password, confirm password
- Sign Out button
- Confirmation dialog for logout

### Step 2.6: Update Navigation ⏱️ 15 mins

**Update File**: `App.js`

**Changes**:
- Add SettingsScreen route
- Export from SettingsScreen.js

**Update File**: `src/screens/DashboardScreen.js`

**Changes**:
- Add Settings button in header or menu
- Navigate to Settings on button press

---

## 🎯 Phase 3: Frontend - Service Layer (45 mins - 1 hour)

### Step 3.1: Create Preferences Service ⏱️ 30 mins

**File**: `src/services/preferencesService.js`

**Methods to Implement**:

```javascript
export const preferencesService = {
  // Get all preferences
  getPreferences: async (token) => {
    // GET /api/auth/preferences
    // Header: Authorization: Bearer token
  },

  // Initialize preferences
  initializePreferences: async (token) => {
    // POST /api/auth/preferences/init
    // Header: Authorization: Bearer token
  },

  // Update specific preference
  updatePreference: async (token, key, value) => {
    // PUT /api/auth/preferences/:key
    // Body: { value }
    // Header: Authorization: Bearer token
  },

  // Update notifications
  updateNotificationSettings: async (token, notifications) => {
    // PUT /api/auth/preferences/notifications
    // Body: notifications object
    // Header: Authorization: Bearer token
  },

  // Change password
  changePassword: async (token, currentPassword, newPassword) => {
    // POST /api/auth/change-password
    // Body: { currentPassword, newPassword }
    // Header: Authorization: Bearer token
  },

  // Update profile
  updateProfile: async (token, profileData) => {
    // PATCH /api/auth/profile
    // Body: { name, age, phone }
    // Header: Authorization: Bearer token
  }
};
```

### Step 3.2: Create Type Definitions ⏱️ 15 mins

**File**: `src/types/preferences.js`

**Types to Define**:
```javascript
export const PREFERENCE_TYPES = {
  UserPreferences: {
    userId: 'string',
    dataSharing: 'boolean',
    analyticsEnabled: 'boolean',
    thirdPartyIntegration: 'boolean',
    notifications: 'NotificationSettings'
  },
  
  NotificationSettings: {
    email: 'boolean',
    push: 'boolean',
    sms: 'boolean',
    dailyReminders: 'boolean',
    weeklyDigest: 'boolean',
    urgentOnly: 'boolean'
  }
};
```

### Step 3.3: Update AuthContext ⏱️ 20 mins

**Update File**: `src/context/AuthContext.js`

**New State**:
```javascript
const [preferences, setPreferences] = useState(null);
const [preferencesLoading, setPreferencesLoading] = useState(false);
const [preferencesError, setPreferencesError] = useState(null);
```

**New Methods**:
```javascript
loadPreferences: async () => {
  // Fetch from API using token
},

updatePreference: async (key, value) => {
  // Call service and update state
},

changePassword: async (currentPwd, newPwd) => {
  // Call service
},

updateProfile: async (profileData) => {
  // Call service and update user state
}
```

---

## 🎯 Phase 4: Integration & Testing (1-1.5 hours)

### Step 4.1: Test Backend Endpoints ⏱️ 30 mins

**Using Postman or curl**:

1. Test GET /preferences (with valid token)
2. Test POST /preferences/init (initialize)
3. Test PUT /preferences/dataSharing (toggle)
4. Test PUT /preferences/notifications
5. Test POST /change-password
6. Test PATCH /profile

### Step 4.2: Test Frontend Settings Screen ⏱️ 20 mins

**Manual Testing**:
1. Open Settings Screen
2. Verify data loads
3. Edit profile fields
4. Toggle privacy switches
5. Toggle notification switches
6. Change password
7. Logout
8. Login again
9. Verify changes persisted

### Step 4.3: Test Error Handling ⏱️ 15 mins

**Test Cases**:
1. Invalid token → show login
2. Network error → show message + retry
3. Validation error → show field errors
4. Server error → show message
5. Timeout → retry with backoff

### Step 4.4: Test on Both Platforms ⏱️ 15 mins

**iOS**:
```bash
npm run ios
# Test all flows on iOS simulator
```

**Android**:
```bash
npm run android
# Test all flows on Android emulator
```

### Step 4.5: Performance & Polish ⏱️ 15 mins

- Remove console.logs in production code
- Add loading skeletons
- Optimize re-renders
- Smooth animations
- Error messages clear and helpful

---

## Step-by-Step Implementation Checklist

### Backend (Priority Order)

- [ ] **1.1** Create `backend/middleware/auth.js` - JWT verification
- [ ] **1.2** Create Preferences schema in MongoDB
- [ ] **1.3** Create `backend/routes/preferences.js` with GET endpoint
- [ ] **1.4** Add POST /preferences/init endpoint
- [ ] **1.5** Add PUT /preferences/:key endpoint
- [ ] **1.6** Add PUT /preferences/notifications endpoint
- [ ] **1.7** Update auth.js - Add JWT to login response
- [ ] **1.8** Add POST /change-password endpoint
- [ ] **1.9** Add PATCH /profile endpoint
- [ ] **1.10** Update `backend/server.js` - Register preferences route
- [ ] **1.11** Test all endpoints with Postman

### Frontend (Priority Order)

- [ ] **2.1** Create `src/screens/SettingsScreen.js` - Main component
- [ ] **2.2** Add ProfileEditSection with edit form
- [ ] **2.3** Add PrivacySettingsSection with toggles
- [ ] **2.4** Add NotificationSettingsSection with toggles
- [ ] **2.5** Add AccountActionsSection with password/logout
- [ ] **2.6** Create `src/services/preferencesService.js`
- [ ] **2.7** Create `src/types/preferences.js`
- [ ] **2.8** Update `src/context/AuthContext.js` - Add preference methods
- [ ] **2.9** Update `App.js` - Add Settings route
- [ ] **2.10** Update `src/screens/DashboardScreen.js` - Add Settings navigation
- [ ] **2.11** Test on iOS and Android

### Integration & Testing

- [ ] **3.1** Full flow testing: Register → Login → Settings → Save → Logout → Login → Verify
- [ ] **3.2** Error scenarios: Network error, invalid token, server error
- [ ] **3.3** Mobile-specific testing: iOS and Android
- [ ] **3.4** Performance check: Screen load time < 2 seconds
- [ ] **3.5** Create demo video showing all features

---

## 📊 Time Allocation

| Phase | Task | Time | Status |
|-------|------|------|--------|
| **Phase 1** | Backend Setup | 2 hours | ⏳ To Do |
| **Phase 2** | Frontend UI | 1 hour | ⏳ To Do |
| **Phase 3** | Services | 1 hour | ⏳ To Do |
| **Phase 4** | Testing | 1.5 hours | ⏳ To Do |
| **Buffer** | Fixes & Demo | 30 mins | ⏳ To Do |
| **TOTAL** | | **6 hours** | |

---

## 🚀 Quick Start Commands

```bash
# Start backend
cd backend
npm install jsonwebtoken  # If not already installed
npm run server:dev

# In another terminal - Start frontend
npm start
# Press 'a' for Android or 'i' for iOS

# Testing backend (using curl or Postman)
# Get preferences (need valid token from login)
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/auth/preferences
```

---

## ⚠️ Critical Success Factors

### Must Complete By 7 PM
1. ✅ Settings screen displays data
2. ✅ API endpoints return correct data
3. ✅ Database stores preferences
4. ✅ Form submission works
5. ✅ Authentication/JWT works
6. ✅ Works on iOS and Android
7. ✅ Demo video created

### Testing Before Demo
1. ✅ Full registration flow
2. ✅ Settings screen access
3. ✅ Preference updates save
4. ✅ Logout and login again
5. ✅ Verify data persisted
6. ✅ No crashes or errors

---

## 📝 Code Quality Guidelines

### During Implementation
- Use meaningful variable names
- Add comments for complex logic
- Follow existing code patterns
- Keep functions small and focused
- Proper error handling everywhere

### Before Submission
- Remove all console.logs (except critical errors)
- Add JSDoc comments for functions
- Ensure no hardcoded values
- Test error scenarios
- Verify platform compatibility

---

## 🎬 Demo Video Requirements

**Duration**: 2-3 minutes

**Show**:
1. App startup
2. User registration
3. Profile setup completion
4. Login to dashboard
5. Navigate to settings
6. Edit profile information
7. Toggle privacy settings
8. Change password (optional if time limited)
9. Logout
10. Login again
11. Verify settings persisted
12. Show database entries (if possible)

**Platform**: Show working on iOS or Android (preferably both)

---

## 📌 Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Settings screen created | Yes | ⏳ |
| API endpoints working | 5+ working | ⏳ |
| Database preferences stored | Yes | ⏳ |
| Form validation | All fields | ⏳ |
| Error handling | All error types | ⏳ |
| iOS testing | Working | ⏳ |
| Android testing | Working | ⏳ |
| Demo video | 2-3 mins | ⏳ |
| Code documentation | Comprehensive | ⏳ |
| Deadline met | 7 PM | ⏳ |

---

## 🔗 File Dependencies

```
Frontend:
  SettingsScreen.js
    ├─ AuthContext.js (for auth + preferences)
    ├─ preferencesService.js (API calls)
    └─ types/preferences.js (type definitions)
  
Backend:
  preferences.js (route)
    ├─ middleware/auth.js (JWT verification)
    ├─ models/Preference.js (database schema)
    └─ config/db.js (MongoDB connection)
  
auth.js (route)
    ├─ Change password endpoint
    └─ Profile update endpoint
```

---

## Next Steps

1. ✅ Review this implementation plan
2. ✅ Start with backend middleware
3. ✅ Create database schema
4. ✅ Implement API endpoints
5. ✅ Build frontend UI
6. ✅ Create services
7. ✅ Test thoroughly
8. ✅ Record demo
9. ✅ Submit by 7 PM

**Let's begin with Phase 1 now!**
