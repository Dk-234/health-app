# App Testing Checklist ✅

## Current Status
- ✅ Expo server running successfully
- ✅ Firebase v9.23.0 installed
- ✅ Firebase properly initialized with React Native persistence
- ✅ No build errors
- ✅ QR code generated for testing

## How to Test

### 1. Open the App
- Open **Expo Go** app on your Android phone
- Scan the QR code shown in terminal
- Wait for app to load

### 2. Test Authentication Screens

#### Login Screen Test
- [ ] App loads without crashing
- [ ] Login screen displays correctly
- [ ] "Email" and "Password" input fields visible
- [ ] "Remember Me" checkbox visible
- [ ] "Forgot Password?" link visible
- [ ] "Login" button visible
- [ ] "Don't have an account? Register" link visible

#### Register Screen Test
- [ ] Click "Register" link
- [ ] Registration form displays
- [ ] Fields: Full Name, Email, Password, Confirm Password
- [ ] "Register" button works
- [ ] "Already have an account? Login" link works

#### Reset Password Test
- [ ] Click "Forgot Password?" on login screen
- [ ] Reset password screen displays
- [ ] Email input field visible
- [ ] "Reset Password" button visible
- [ ] "Back to Login" link works

### 3. Test Firebase Integration

#### Registration Flow
1. [ ] Go to Register screen
2. [ ] Fill in: 
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "Test@123"
   - Confirm Password: "Test@123"
3. [ ] Click "Register"
4. [ ] **Expected:** Success message, navigate to Dashboard
5. [ ] **Check Firebase Console:** User created in Authentication

#### Login Flow
1. [ ] Go to Login screen
2. [ ] Enter registered email and password
3. [ ] Click "Login"
4. [ ] **Expected:** Navigate to Dashboard
5. [ ] **Check Firebase Console:** User signed in

#### Password Reset Flow
1. [ ] Go to Reset Password screen
2. [ ] Enter registered email
3. [ ] Click "Reset Password"
4. [ ] **Expected:** Success message
5. [ ] **Check Email:** Password reset email received

### 4. Test Dashboard

#### Data Display
- [ ] Dashboard loads without crashing
- [ ] Health metric cards display:
  - Steps (with icon)
  - Calories (with icon)
  - Heart Rate (with icon)
  - Sleep Hours (with icon)
- [ ] "Activity Over Time" chart displays
- [ ] "Nutrition Breakdown" chart displays

#### Firebase Data Loading
- [ ] Dashboard shows loading indicator
- [ ] After loading, displays either:
  - Health data if available in Firestore
  - Default/empty state if no data
- [ ] No error messages in console

### 5. Test Navigation

#### Screen Transitions
- [ ] Login → Register (smooth transition)
- [ ] Register → Login (smooth transition)
- [ ] Login → Reset Password (smooth transition)
- [ ] Reset Password → Login (smooth transition)
- [ ] Login → Dashboard (after successful login)

#### Back Navigation
- [ ] Android back button works correctly
- [ ] No crashes when navigating back

### 6. Error Handling

#### Firebase Errors
Test these scenarios:
- [ ] Login with invalid credentials → Shows error
- [ ] Register with existing email → Shows error
- [ ] Register with weak password → Shows error
- [ ] Reset password with non-existent email → Shows appropriate message

#### Network Errors
- [ ] Turn off WiFi/data
- [ ] Try to login → Shows network error
- [ ] Turn on WiFi/data
- [ ] App recovers and works normally

## Common Issues & Solutions

### If app crashes on load:
1. Clear Expo cache: `npx expo start --clear`
2. Check terminal for error messages
3. Verify Firebase config in `src/config/firebase.js`

### If Firebase auth doesn't work:
1. Check Firebase Console → Authentication is enabled
2. Verify Email/Password provider is enabled
3. Check Firebase config matches your project

### If "Component auth has not been registered yet" error appears:
⚠️ **This should NOT happen anymore!**
- If it does, check `package.json` - Firebase should be `^9.23.0`
- Run `npm install` to ensure correct version
- Restart with `npx expo start --clear`

## Success Criteria
✅ All authentication screens load without crashes
✅ User can register a new account in Firebase
✅ User can login with registered credentials
✅ Password reset email is sent
✅ Dashboard loads and displays health metrics
✅ No console errors related to Firebase initialization
✅ Navigation between screens works smoothly

## Quick Test Commands
```bash
# Restart server with clean cache
npx expo start --clear

# Check Firebase version
npm list firebase

# Reinstall dependencies if needed
npm install

# View logs
# (Logs appear in terminal after scanning QR code)
```

## Firebase Console Checks
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: "health-tracking-app-5f387"
3. Check **Authentication** tab:
   - Users should appear after registration
   - Sign-in methods: Email/Password should be enabled
4. Check **Firestore Database**:
   - Collections: `users`, `healthData` should appear after first use

## Expected Terminal Output
When app runs successfully:
```
✓ Built successfully
✓ Firebase initialized
✓ Auth service ready
✓ Firestore connected
```

No errors like:
- ❌ "Component auth has not been registered yet"
- ❌ "Firebase: No Firebase App"
- ❌ "Firebase: Error"

---

**Status:** Ready for testing! 🚀
**Last Updated:** After Firebase v9 fix
