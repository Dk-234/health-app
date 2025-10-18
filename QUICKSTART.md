# ⚡ Quick Start Guide - Health Monitoring App with MongoDB

## 🎯 What Changed?
Your app now uses **MongoDB** for data storage, **security questions** for password reset, and requires **profile setup after registration**.

---

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd d:\health-app
npm install
```

### Step 2: Set Up MongoDB

**Choose ONE option:**

#### Option A: Local MongoDB (Easiest for testing)
1. Download [MongoDB Community](https://www.mongodb.com/try/download/community)
2. Install and start MongoDB
   ```bash
   # Windows - Run mongod in Command Prompt
   mongod
   ```

#### Option B: MongoDB Atlas (Cloud - No installation)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account and cluster
3. Get connection string from "Connect" button

### Step 3: Configure Environment
1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Edit `.env` and add your MongoDB connection:
   ```
   MONGODB_URI=mongodb://localhost:27017/health-app
   PORT=3000
   NODE_ENV=development
   ```

### Step 4: Start Backend Server
```bash
npm run server:dev
```

Expected output:
```
╔════════════════════════════════════════╗
║  🏥 Health Monitoring App Backend     ║
║  ✅ Server Running on Port 3000       ║
║  📊 MongoDB Connected                 ║
╚════════════════════════════════════════╝
```

### Step 5: Update Frontend Configuration
Edit `src/services/authService.js` line 8:

```javascript
// For local development:
const API_BASE_URL = 'http://localhost:3000/api';

// For Android Emulator:
const API_BASE_URL = 'http://10.0.2.2:3000/api';

// For physical device (replace with your IP):
const API_BASE_URL = 'http://192.168.x.x:3000/api';
```

### Step 6: Start React Native App
In a **new terminal**:
```bash
npm start
```

---

## 📱 Test the New Features

### 1. Register & Profile Setup
1. Click **"Sign Up"**
2. Fill form: Name, Email, Password (8+ chars with uppercase, lowercase, number)
3. Verify CAPTCHA
4. Will navigate to **"Complete Your Profile"**
5. Select avatar (emoji)
6. Enter age and phone
7. Answer 3 security questions (these are for password reset!)
8. Click **"Complete Setup & Login"**
9. You're now on **Dashboard** ✅

### 2. Test Password Reset
1. From Dashboard → Logout
2. On Login screen → Click **"Forgot Password?"**
3. Enter your email
4. Verify CAPTCHA
5. Answer your 3 security questions
6. Set new password
7. Login with new credentials ✅

### 3. View Profile
1. On Dashboard → Click profile avatar (top-right)
2. See your profile details
3. Click **"Change Password"** to reset it anytime ✅

---

## 📁 Key Files Created/Modified

### New Files
- `backend/server.js` - Express backend
- `backend/config/db.js` - MongoDB connection
- `backend/config/questions.js` - Security questions
- `backend/routes/auth.js` - API endpoints
- `src/screens/ProfileSetupScreen.js` - Post-registration setup
- `src/screens/ForgotPasswordScreen.js` - Security question password reset
- `MONGODB_SETUP.md` - Full backend documentation
- `CHANGES.md` - All changes made

### Modified Files
- `src/services/authService.js` - Now uses MongoDB API
- `src/context/AuthContext.js` - New `completeProfile` function
- `src/screens/LoginScreen.js` - Added "Forgot Password" link
- `src/screens/RegisterScreen.js` - Navigate to ProfileSetup
- `src/screens/ProfileScreen.js` - Added "Change Password" button
- `App.js` - Added new screen routes
- `package.json` - Added backend dependencies

---

## 🔐 Security Questions (3 per user)

Your app randomly selects 3 from these 10 questions:

1. What is the name of your first pet?
2. What city were you born in?
3. What is your mother's maiden name?
4. What is the name of your best friend in high school?
5. What was the name of your first teacher?
6. What is your favorite movie?
7. What street did you live on in third grade?
8. What is the make and model of your first car?
9. What is your favorite book?
10. What was your first job?

---

## ⚙️ Running Backend Commands

```bash
# Development mode (auto-reload on changes)
npm run server:dev

# Production mode
npm run server

# Frontend only (backend must be running)
npm start

# Both together (need 2 terminals)
Terminal 1: npm run server:dev
Terminal 2: npm start
```

---

## 🧪 Test Credentials

After first registration, use those credentials to test.

Or create test users:
```bash
Email: test@example.com
Password: TestPass123
Name: Test User
```

---

## 💾 Where's My Data?

- **All user data** → MongoDB (persistent, survives app restart)
- **Passwords** → Bcrypt hashed (not stored in plaintext)
- **Security answers** → Bcrypt hashed (extra secure)
- **Previous AsyncStorage data** → Cleared (fresh start with MongoDB)

---

## 🆘 Troubleshooting

### "MongoDB connection failed"
- Is MongoDB running? Check:
  ```bash
  mongod    # Windows Command Prompt
  mongo     # Should connect
  ```
- Is connection string correct in `.env`?

### "Cannot reach backend from app"
- Backend running on port 3000? Check: `http://localhost:3000/api/health`
- Check `API_BASE_URL` in `src/services/authService.js`

### "CAPTCHA not showing"
- Ensure `CaptchaComponent` is in `src/components/CaptchaComponent.js`
- Check browser console for errors

### "Profile not saving"
- Check backend logs for errors
- Verify MongoDB is connected
- Check network requests in app debugger

---

## 📚 Full Documentation

For complete details, see:
- **Backend Setup**: `MONGODB_SETUP.md`
- **All Changes**: `CHANGES.md`
- **API Endpoints**: `MONGODB_SETUP.md` → API Endpoints section

---

## ✅ Checklist

- [ ] MongoDB installed/configured
- [ ] `.env` file created with MONGODB_URI
- [ ] Backend running: `npm run server:dev`
- [ ] `API_BASE_URL` updated in `authService.js`
- [ ] Frontend running: `npm start`
- [ ] Tested registration → profile setup → dashboard flow
- [ ] Tested password reset with security questions

---

## 🎉 You're Ready!

Your health monitoring app now has:
- ✅ Persistent MongoDB data storage
- ✅ Security question-based password reset (no email needed!)
- ✅ Mandatory profile completion after registration
- ✅ Auto-login after profile setup
- ✅ Bcrypt password hashing
- ✅ Secure authentication

Start testing! 🚀
