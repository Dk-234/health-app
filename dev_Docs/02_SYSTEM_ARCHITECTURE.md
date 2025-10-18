# System Architecture - Health App Settings Management

## High-Level Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         MOBILE APP (React Native)               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    UI Components                         │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │  SettingsScreen.js                                 │ │  │
│  │  │  ├── ProfileSection                                │ │  │
│  │  │  ├── PrivacySection                                │ │  │
│  │  │  └── AccountActionsSection                         │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            State Management Layer                        │  │
│  │  ┌──────────────┐      ┌──────────────────────────────┐ │  │
│  │  │ AuthContext  │◄────►│ Local Component State (UI)   │ │  │
│  │  │ (Profile,    │      │ (Loading, Errors, Forms)     │ │  │
│  │  │ Preferences) │      └──────────────────────────────┘ │  │
│  │  └──────────────┘             ↓                         │  │
│  │                     AsyncStorage Cache                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          API Service Layer                               │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │ preferencesService.js / authService.js               │ │  │
│  │  │ • getPreferences()                                   │ │  │
│  │  │ • updatePreference()                                 │ │  │
│  │  │ • changePassword()                                   │ │  │
│  │  │ • getNotificationSettings()                          │ │  │
│  │  │ • updateProfile()                                    │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  │                      ↓                                    │  │
│  │        ┌──────────────────────────────┐                  │  │
│  │        │   Axios HTTP Client          │                  │  │
│  │        │ • Auth Headers               │                  │  │
│  │        │ • Error Interceptors         │                  │  │
│  │        │ • Retry Logic                │                  │  │
│  │        │ • Request Timeout            │                  │  │
│  │        └──────────────────────────────┘                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓ (HTTPS)
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND API                               │
│                      (Express.js)                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Request Processing Pipeline                    │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │ 1. Request Received                                │ │  │
│  │  │ 2. CORS/Headers Validation                         │ │  │
│  │  │ 3. JWT Authentication Middleware                  │ │  │
│  │  │ 4. Authorization Check                            │ │  │
│  │  │ 5. Input Validation & Sanitization                │ │  │
│  │  │ 6. Rate Limiting Check                            │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Route Handlers (Express Routes)                │  │
│  │  /api/auth/preferences                                   │  │
│  │  ├── GET    (List all preferences)                       │  │
│  │  ├── POST   (Initialize preferences)                     │  │
│  │  ├── PUT    (Update specific preference)                 │  │
│  │  └── DELETE (Remove preference)                          │  │
│  │                                                           │  │
│  │  /api/auth/profile                                       │  │
│  │  └── PATCH  (Update profile info)                        │  │
│  │                                                           │  │
│  │  /api/auth/change-password                               │  │
│  │  └── POST   (Change password)                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │        Business Logic & Services Layer                   │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │ PreferenceService                                   │ │  │
│  │  │ • Validate preferences                              │ │  │
│  │  │ • Apply business rules                              │ │  │
│  │  │ • Generate audit logs                               │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │ AuthService                                         │ │  │
│  │  │ • Password validation & hashing                     │ │  │
│  │  │ • Profile updates                                   │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │ CacheService                                        │ │  │
│  │  │ • Redis caching strategy                            │ │  │
│  │  │ • Cache invalidation                                │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Data Access Layer (Mongoose)                   │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │ PreferenceModel (MongoDB)                           │ │  │
│  │  │ UserModel (MongoDB)                                 │ │  │
│  │  │ AuditLogModel (MongoDB)                             │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │             MongoDB Collections                         │  │
│  │                                                          │  │
│  │  users                 preferences               auditlogs│  │
│  │  ├── _id              ├── _id                  ├── _id   │  │
│  │  ├── email            ├── userId               ├── userId│  │
│  │  ├── password         ├── dataSharing          ├── action│  │
│  │  ├── name             ├── analytics            ├── key   │  │
│  │  ├── age              ├── thirdParty           ├── oldVal │  │
│  │  ├── phone            ├── notifications        ├── newVal │  │
│  │  ├── avatar           ├── createdAt            ├── timestamp
│  │  ├── createdAt        ├── updatedAt            └── ip    │  │
│  │  └── updatedAt        └── version              │  │
│  │                                                  │  │
│  │  Indexes:                                        │  │
│  │  • users: email (unique), createdAt             │  │
│  │  • preferences: userId (unique), updatedAt      │  │
│  │  • auditlogs: userId, timestamp                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Frontend Component Structure

```
src/
├── screens/
│   ├── SettingsScreen.js                 [Main Settings Container]
│   │   ├── ProfileEditSection            [Profile Management]
│   │   ├── PrivacySettingsSection        [Privacy Controls]
│   │   ├── NotificationSettingsSection   [Notification Controls]
│   │   └── AccountActionsSection         [Change Password, SignOut]
│   └── [Other existing screens]
│
├── components/
│   ├── SettingsSectionHeader.js          [Section Title Component]
│   ├── SettingsToggle.js                 [Toggle Switch Component]
│   ├── SettingsTextField.js              [Input Field Component]
│   ├── SettingsButton.js                 [Action Button Component]
│   └── LoadingIndicator.js               [Loading State Component]
│
├── context/
│   ├── AuthContext.js                    [Extended with preferences]
│   └── PreferencesContext.js             [New - Preferences State]
│
├── services/
│   ├── api.js                            [HTTP Client Setup]
│   ├── preferencesService.js             [New - Preferences API]
│   └── [Existing services]
│
├── config/
│   └── api.config.js                     [New - API Configuration]
│
└── types/
    └── preferences.js                    [New - Type Definitions]
```

### Backend Component Structure

```
backend/
├── server.js                             [Express App Entry]
├── middleware/
│   ├── auth.middleware.js                [JWT Verification]
│   ├── validation.middleware.js          [Input Validation]
│   ├── errorHandler.middleware.js        [Error Handling]
│   └── rateLimiter.middleware.js         [Rate Limiting]
│
├── routes/
│   ├── auth.js                           [Existing Auth Routes]
│   └── preferences.js                    [New - Preferences Routes]
│
├── controllers/
│   ├── authController.js                 [Auth Logic]
│   └── preferencesController.js          [New - Preferences Logic]
│
├── services/
│   ├── preferencesService.js             [Preference Business Logic]
│   ├── authService.js                    [Auth Business Logic]
│   └── cacheService.js                   [Caching Logic]
│
├── models/
│   ├── User.js                           [User Schema]
│   ├── Preference.js                     [New - Preferences Schema]
│   └── AuditLog.js                       [New - Audit Logging Schema]
│
├── utils/
│   ├── logger.js                         [Logging Utility]
│   ├── validators.js                     [Validation Rules]
│   └── helpers.js                        [Helper Functions]
│
├── config/
│   ├── db.js                             [Database Connection]
│   ├── questions.js                      [Security Questions]
│   └── constants.js                      [App Constants]
│
└── tests/
    ├── preferences.test.js               [Preferences Tests]
    └── auth.test.js                      [Auth Tests]
```

---

## Data Flow Diagrams

### User Settings Update Flow

```
User interacts with SettingsScreen
        ↓
Form validation (Client-side)
        ↓
    Valid? No → Show error message
        ↓
    Yes → Show loading state
        ↓
Call preferencesService.updatePreference(key, value)
        ↓
Axios POST /api/auth/preferences/:key
        ↓
        ├─→ Network Error → Retry logic → Queue for sync
        │
        └─→ Success → Handle response
            ↓
        API Response Validation
            ↓
        ├─→ Error → Display error message
        │
        └─→ Success → Update AuthContext
            ↓
        Update AsyncStorage cache
            ↓
        Show success notification
            ↓
        Refresh UI
```

### Backend Preference Update Flow

```
POST /api/auth/preferences/:key
        ↓
CORS Check ✓
        ↓
JWT Middleware
    ├─→ No token → 401 Unauthorized
    └─→ Valid → Extract userId
        ↓
Authorization Middleware
    ├─→ User mismatch → 403 Forbidden
    └─→ Valid → Continue
        ↓
Validation Middleware
    ├─→ Invalid data → 400 Bad Request
    └─→ Valid → Continue
        ↓
Rate Limiter
    ├─→ Exceeded → 429 Too Many Requests
    └─→ OK → Continue
        ↓
preferenceController.updatePreference()
    ├─→ Validate business logic
    ├─→ Check current value
    └─→ Call preferencesService
        ↓
preferencesService.updatePreference()
    ├─→ Hash sensitive data if needed
    ├─→ Generate audit log entry
    ├─→ Update database
    └─→ Invalidate cache
        ↓
Database Update (MongoDB)
        ↓
    ├─→ Error → Rollback, log error
    │
    └─→ Success → Cache new value
        ↓
Return 200 OK with updated data
        ↓
Send to client
        ↓
Client receives & updates UI
```

### Offline Sync Flow

```
User offline → Makes changes locally
        ↓
Store in AsyncStorage with "pending" flag
        ↓
Show "Offline - Changes will sync" message
        ↓
Network reconnected → Detect via NetworkInfo
        ↓
Trigger sync process
        ↓
    For each pending change:
        ├─→ Retry API call
        │   ├─→ Success → Remove pending flag, show notification
        │   └─→ Error → Retry with exponential backoff
        │
        └─→ Conflict detected?
            ├─→ Yes → Show conflict resolution UI
            └─→ No → Complete sync
```

---

## Authentication & Security Flow

```
┌─────────────────────────────────────┐
│ Login Successful                    │
├─────────────────────────────────────┤
│ Backend generates JWT token         │
│ Refresh token stored in secure      │
│ storage (optional)                  │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│ Client stores JWT in AsyncStorage   │
│ & Memory                            │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│ API Service adds to headers:        │
│ Authorization: Bearer <JWT>         │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│ Backend receives request            │
├─────────────────────────────────────┤
│ 1. Verify JWT signature             │
│ 2. Check token expiration           │
│ 3. Extract userId from token        │
└─────────────────────────────────────┘
        ↓
    Valid?
    ├─→ No → Return 401 Unauthorized
    │
    └─→ Yes → Authorize for resource
        ├─→ Can access? → Process request
        └─→ Cannot → Return 403 Forbidden
```

---

## State Management Strategy

### AuthContext Extension (New Methods)

```javascript
const AuthContext = {
  // Existing
  state: {
    user: null,
    isAuthenticated: false
  },
  
  // New - Preferences
  state: {
    preferences: {
      dataSharing: boolean,
      analyticsEnabled: boolean,
      thirdPartyIntegration: boolean,
      notifications: NotificationSettings
    },
    preferencesLoading: boolean,
    preferencesError: string | null
  },
  
  // Methods
  methods: {
    // Existing
    login(),
    logout(),
    register(),
    
    // New
    loadPreferences(),
    updatePreference(key, value),
    updateProfile(profileData),
    changePassword(currentPassword, newPassword),
    initializePreferences()
  }
}
```

### Local Component State (SettingsScreen)

```javascript
const [formData, setFormData] = useState({
  name: '',
  age: '',
  phone: ''
});

const [formErrors, setFormErrors] = useState({});
const [loading, setLoading] = useState(false);
const [editMode, setEditMode] = useState(false);
const [successMessage, setSuccessMessage] = useState('');
const [showPasswordForm, setShowPasswordForm] = useState(false);
```

---

## Caching Strategy

```
┌─────────────────────────────────────┐
│ Client Preferences Cache            │
├─────────────────────────────────────┤
│ AsyncStorage                        │
│ └─→ preferences (TTL: 5 min)       │
│ └─→ lastSyncTime                    │
│ └─→ pendingChanges (for offline)   │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│ Server Preferences Cache            │
├─────────────────────────────────────┤
│ Redis (Optional)                    │
│ └─→ preferences:userId (TTL: 10 min)│
│ └─→ rate_limit:userId               │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│ Database                            │
├─────────────────────────────────────┤
│ MongoDB                             │
│ └─→ Persistent storage              │
│ └─→ Audit logs                      │
└─────────────────────────────────────┘
```

---

## Error Handling Architecture

```
Frontend Error Types:
├── Network Errors
│   ├── No internet → Offline mode
│   ├── Timeout → Retry with backoff
│   └── CORS error → Show user message
├── Validation Errors
│   ├── Client-side → Show field errors
│   └── Server-side → Show error message
├── Authentication Errors
│   ├── 401 Unauthorized → Redirect to login
│   └── 403 Forbidden → Show permission error
├── Server Errors
│   ├── 500 Error → Retry or show message
│   └── Rate limit → Show "Try again later"
└── Business Logic Errors
    ├── Invalid data → Show error details
    └── Resource not found → Handle gracefully

Backend Error Handling:
├── Input Validation
│   └── Return 400 with error details
├── Authentication
│   └── Return 401 with message
├── Authorization
│   └── Return 403 with message
├── Rate Limiting
│   └── Return 429 with retry info
├── Database Errors
│   └── Return 500, log error
└── Unexpected Errors
    └── Return 500, alert admins
```

---

## Performance Optimization Points

```
Frontend:
├── Component Memoization
│   └── useMemo for expensive computations
├── Lazy Loading
│   └── Code splitting for settings components
├── Debouncing
│   └── Debounce form input changes
├── Image Optimization
│   └── Lazy load avatars
└── Bundle Optimization
    └── Tree shaking, minification

Backend:
├── Database Indexing
│   ├── userId index on preferences
│   ├── createdAt index on auditlogs
│   └── email index on users
├── Query Optimization
│   ├── Projection (select only needed fields)
│   └── Connection pooling
├── Caching
│   ├── Redis for preferences
│   └── Cache invalidation on updates
├── API Optimization
│   ├── Pagination for large datasets
│   └── Compression for responses
└── Rate Limiting
    └── Prevent abuse and overload
```

---

## Deployment Architecture

```
Development:
├── Local MongoDB instance
├── Express server on http://localhost:5000
└── React Native on Expo

Production:
├── MongoDB Atlas (Cloud)
├── Express server on Cloud Platform
│   ├── AWS EC2 / ECS
│   ├── Heroku
│   ├── Digital Ocean
│   └── Azure
├── Redis Cache (Optional)
├── Logging service (CloudWatch, Datadog)
├── CI/CD Pipeline (GitHub Actions)
└── Monitoring & Alerts
```
