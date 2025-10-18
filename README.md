# Health Monitoring App

A comprehensive React Native health monitoring application with Firebase authentication, real-time data storage, dashboard visualization, and health data tracking.

---

## 📋 Technical Implementation Answers

This README includes detailed answers to the comprehensive settings screen implementation questions, covering frontend, backend, and integration aspects.

---

## ✨ Features

### 🔐 Authentication with Firebase
- **User Registration** - Create account with email/password
- **Login** - Secure authentication with Firebase Auth
- **Password Reset** - Email-based password recovery
- **CAPTCHA Protection** - Custom CAPTCHA for security
- **Session Management** - Persistent authentication with AsyncStorage

### 📊 Health Dashboard
- **Real-time Health Metrics**:
  - Daily steps tracking
  - Heart rate monitoring
  - Sleep hours
  - Calories burned
- **Interactive Charts**:
  - Line chart for heart rate trends
  - Bar chart for daily steps
  - Progress chart for daily goals
- **Multiple Time Periods**: View data for 7, 30, or 90 days
- **Pull to Refresh**: Update data with a simple pull gesture

### 🔥 Firebase Integration
- **Firebase Authentication**: Secure user management
- **Firestore Database**: Real-time data storage and synchronization
- **Cloud Storage**: User data and health metrics
- **Offline Support**: Data persistence with AsyncStorage

## Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Authentication**: Firebase Authentication
- **Database**: Cloud Firestore
- **Navigation**: React Navigation
- **UI Library**: React Native Paper
- **Charts**: React Native Chart Kit
- **Form Validation**: Formik + Yup
- **State Management**: React Context API
- **Storage**: AsyncStorage + Firestore

## Installation

1. **Clone the repository** (or navigate to project folder):
```bash
cd health-app
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up Firebase** (IMPORTANT!):
   - Follow the detailed guide in `FIREBASE_SETUP.md`
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Update `src/config/firebase.js` with your credentials

4. **Start the development server**:
```bash
npm start
```

5. **Run on your preferred platform**:
```bash
npm run android  # For Android
npm run ios      # For iOS
npm run web      # For Web
```

## 🔥 Firebase Setup (Required)

This app requires Firebase to function. Follow these steps:

### Quick Setup
1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)
2. Enable **Email/Password** authentication
3. Create **Firestore database**
4. Copy your Firebase config to `src/config/firebase.js`

### Detailed Instructions
See `FIREBASE_SETUP.md` for complete step-by-step instructions.

### Quick Reference
See `FIREBASE_QUICK_REF.md` for common Firebase operations and code snippets.

## Project Structure

```
health-app/
├── src/
│   ├── components/
│   │   └── CaptchaComponent.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── ResetPasswordScreen.js
│   │   └── DashboardScreen.js
│   └── services/
│       └── api.js
├── App.js
├── package.json
├── babel.config.js
└── app.json
```

## Backend API Example

Here's a sample structure for your backend API:

### Login Endpoint
```
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123",
  "captchaToken": "abc123"
}

Response:
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Get Health Metrics
```
GET /health/metrics
Headers: Authorization: Bearer {token}

Response:
{
  "steps": 8547,
  "heartRate": 72,
  "sleep": 7.5,
  "calories": 2341
}
```

## Security Features

- Form validation with Yup
- Password strength requirements
- Custom CAPTCHA implementation
- Token-based authentication
- Secure password input fields
- AsyncStorage for secure token storage

## Customization

### Charts
Modify chart configurations in `DashboardScreen.js`:
```javascript
const chartConfig = {
  backgroundColor: '#ffffff',
  color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
  // ... other configs
};
```

### Theme
Customize colors and styles in the respective screen files or create a theme configuration file.

## Notes

- The app currently uses mock data for demonstration
- Replace mock data with actual API calls in production
- Update the API base URL before deployment
- Implement proper error handling for production
- Add environment variables for API configuration
- Consider implementing biometric authentication for enhanced security

## License

MIT License
