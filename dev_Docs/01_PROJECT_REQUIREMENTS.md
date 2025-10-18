# Health App Settings Management - Project Requirements

## Assignment Overview
- **Duration**: 3-4 hours
- **Difficulty**: Intermediate
- **Deadline**: 7 PM, 18th Oct 2025

---

## Part 1: Frontend Implementation Requirements

### 1.1 Settings Screen Creation
- **Location**: `src/screens/SettingsScreen.js`
- **Navigation**: Must be accessible from home/dashboard screen
- **Platform Support**: iOS and Android (React Native)

### 1.2 Settings Screen Sections

#### A. Profile Section
- **Edit Functionality**: Enable users to modify profile information
- **Fields to Manage**:
  - Full Name
  - Age
  - Phone Number
- **Features**:
  - Pre-populated current values
  - Edit/Save mode toggle
  - Inline editing capability

#### B. Privacy Settings
- **Data Sharing Controls**:
  - Option to enable/disable health data sharing
  - Toggle for analytics data collection
  - Toggle for third-party app integration
- **Persistence**: Save preferences to backend

#### C. Account Actions
- **Change Password**:
  - Current password verification
  - New password validation
  - Confirm password match
- **Sign Out**:
  - Clear local session
  - Clear cached data
  - Redirect to login screen

### 1.3 Form Validation Requirements

#### Profile Updates
- **Name Validation**:
  - Required field
  - Minimum 2 characters
  - Maximum 50 characters
  - Only alphabets and spaces allowed

- **Age Validation**:
  - Required field
  - Numeric only
  - Range: 13-120 years old

- **Phone Validation**:
  - Required field
  - Valid phone number format
  - Minimum 10 digits
  - Support international formats

#### Password Change
- **Current Password**:
  - Required and verified against backend
  - Must match user's current password
- **New Password**:
  - Minimum 8 characters
  - Must contain uppercase letter
  - Must contain lowercase letter
  - Must contain number
  - Must contain special character
- **Confirm Password**:
  - Must match new password exactly

### 1.4 State Management & UI/UX

#### Loading States
- Show loading indicator during API calls
- Disable form submission during loading
- Display skeleton loaders for initial data fetch

#### Error Handling
- Display validation error messages
- Show API error messages with retry option
- Toast/snackbar notifications for success/failure
- Network error detection and offline mode indication

#### State Management Approach
- **Primary**: React Context API (AuthContext extension)
- **Local State**: useState for form fields and UI states
- **Async Storage**: For offline preference caching
- **Alternative Consideration**: Redux for complex state (if needed)

#### Data Flow
```
SettingsScreen (UI) 
    ↓
AuthContext (State Management) 
    ↓
API Service Layer 
    ↓
Backend API
```

---

## Part 2: Backend Implementation Requirements

### 2.1 RESTful API Endpoints

#### User Preferences Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/auth/preferences` | Retrieve all user preferences | JWT |
| POST | `/api/auth/preferences/init` | Create initial preferences | JWT |
| PUT | `/api/auth/preferences/:key` | Update specific preference | JWT |
| GET | `/api/auth/preferences/notifications` | Get notification settings | JWT |
| PUT | `/api/auth/preferences/notifications` | Update notification settings | JWT |

#### Additional Endpoints (if needed)
- `PATCH /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `DELETE /api/auth/preferences/:key` - Delete specific preference

### 2.2 Request/Response Examples

#### GET /api/auth/preferences
**Response**:
```json
{
  "success": true,
  "data": {
    "userId": "user123",
    "dataSharing": true,
    "analyticsEnabled": true,
    "thirdPartyIntegration": false,
    "notificationSettings": {
      "email": true,
      "push": true,
      "sms": false,
      "dailyReminders": true
    },
    "updatedAt": "2024-10-18T10:30:00Z"
  }
}
```

#### PUT /api/auth/preferences/:key
**Request**:
```json
{
  "value": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Preference updated successfully",
  "data": {
    "key": "dataSharing",
    "value": true,
    "updatedAt": "2024-10-18T10:35:00Z"
  }
}
```

### 2.3 Security Measures

#### User Authentication & Authorization
- **JWT Tokens**: Use JWT for API authentication
- **Token Validation**: Verify token on every request
- **Token Expiration**: 24-hour expiration with refresh tokens
- **User ID Verification**: Ensure users can only access their own preferences
- **Role-Based Access**: Admin endpoints for preference management (optional)

#### Input Validation & Sanitization
- **Schema Validation**: Use Mongoose schemas or Joi validator
- **Type Checking**: Ensure correct data types
- **String Sanitization**: Remove special characters where needed
- **Size Limits**: Set maximum lengths for all fields
- **Enum Validation**: For limited options (true/false toggles)
- **XSS Prevention**: Sanitize all user input

#### Rate Limiting & Abuse Prevention
- **Rate Limiting**: Max 60 requests per minute per user
- **Throttling**: Implement backoff strategy
- **Request Validation**: Reject malformed requests early
- **IP Blocking**: Block suspicious activity
- **Account Lockout**: Temporary lockout after failed attempts

### 2.4 Data Handling & Performance

#### Data Validation & Error Responses
- **Validation Errors**: Return 400 with detailed error messages
- **Authentication Errors**: Return 401 for invalid tokens
- **Authorization Errors**: Return 403 for unauthorized access
- **Not Found Errors**: Return 404 for missing resources
- **Server Errors**: Return 500 with error tracking

**Standard Error Response Format**:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": []
}
```

#### Performance Optimization & Caching
- **Database Indexing**: Index userId, createdAt, updatedAt fields
- **Query Optimization**: Use projection to fetch only needed fields
- **Caching Strategy**: Cache preferences for 5-10 minutes
- **Pagination**: If preferences list grows large
- **Connection Pooling**: Reuse database connections

#### Audit Logging
- **Change Logging**: Log all preference modifications
- **Timestamp Tracking**: Record when/who changed what
- **Rollback Capability**: Store previous values for audits
- **Admin Dashboard**: View user preference change history

---

## Part 3: Integration Requirements

### 3.1 API Service Layer Structure

**File**: `src/services/preferencesService.js`

```javascript
// Methods required:
- getPreferences(userId)
- initializePreferences(userId, defaultPrefs)
- updatePreference(userId, key, value)
- updateNotificationSettings(userId, settings)
- getNotificationSettings(userId)
- changePassword(userId, currentPassword, newPassword)
```

### 3.2 Error Handling & Loading States

#### Frontend Error Handling
- **API Errors**: Catch and display user-friendly messages
- **Network Errors**: Show offline mode message
- **Validation Errors**: Display field-level validation
- **Retry Logic**: Implement exponential backoff for retries

#### Loading State Management
- **Data Fetching**: Show skeleton or spinner
- **Form Submission**: Disable buttons during submission
- **Progressive Loading**: Load critical data first
- **Success Feedback**: Toast/snackbar notifications

### 3.3 Offline Support

#### Offline Capabilities
- **Local Caching**: Store preferences in AsyncStorage
- **Optimistic Updates**: Show changes immediately
- **Sync Queue**: Queue changes when offline
- **Sync on Reconnect**: Auto-sync when network returns
- **Conflict Resolution**: Handle conflicts between local and remote

#### Implementation Strategy
- Track last sync timestamp
- Compare local vs remote on reconnect
- Priority: Server data wins on conflicts
- User notification for conflicts

### 3.4 Type Definitions

**File**: `src/types/preferences.js` or `preferences.ts`

```typescript
// Required types:

interface UserPreferences {
  userId: string;
  dataSharing: boolean;
  analyticsEnabled: boolean;
  thirdPartyIntegration: boolean;
  notificationSettings: NotificationSettings;
  updatedAt: string;
  createdAt: string;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  dailyReminders: boolean;
  weeklyDigest: boolean;
  urgentOnly: boolean;
}

interface PreferenceUpdateRequest {
  key: string;
  value: any;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

---

## Expected Deliverables

### 1. Frontend Implementation
- ✅ Complete `SettingsScreen.js` component
- ✅ Form validation system
- ✅ Error handling UI
- ✅ Loading states
- ✅ Navigation integration

### 2. Backend Implementation
- ✅ Express.js API endpoints
- ✅ MongoDB schema for preferences
- ✅ Authentication middleware
- ✅ Input validation
- ✅ Error handling

### 3. Database
- ✅ MongoDB collection schema
- ✅ Indexes definition
- ✅ Migration scripts (if needed)

### 4. API Documentation
- ✅ Postman collection (or API docs)
- ✅ Request/response examples
- ✅ Error codes documentation

### 5. Testing & Demo
- ✅ Working settings screen (iOS & Android)
- ✅ End-to-end functionality demo
- ✅ Screen recordings showing all features

### 6. Code Quality
- ✅ Proper documentation/comments
- ✅ Error handling
- ✅ Performance optimizations
- ✅ Security best practices

---

## Bonus Considerations

### Performance Optimizations
- Implement preference caching strategy
- Lazy load settings components
- Memoize components to prevent re-renders
- Debounce form inputs

### Real-Time Synchronization
- WebSocket implementation for multi-device sync
- Conflict resolution strategy
- Last-write-wins policy
- User notifications for remote changes

### Accessibility Features
- Screen reader support
- High contrast mode
- Font size adjustments
- Keyboard navigation

### Scalability Design
- Microservices architecture consideration
- Database sharding for large user base
- API rate limiting per user tier
- CDN for static assets
- Message queue for async operations

---

## Key Metrics & Success Criteria

✅ Settings screen loads within 2 seconds
✅ Form validation works on all fields
✅ API endpoints respond within 200ms
✅ Offline changes sync on reconnect
✅ Zero data loss during sync
✅ All security measures implemented
✅ Works on both iOS and Android
✅ Clean, maintainable code structure
✅ Comprehensive error messages
✅ Audit trail for all changes
