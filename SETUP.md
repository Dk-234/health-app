# 🏥 Health Monitoring App - Complete Setup Guide

## 📋 Project Overview

Your health monitoring app now features:
- **MongoDB Backend** for persistent data storage
- **RESTful API** using Express.js
- **Security Questions** for password recovery
- **Mandatory Profile Setup** after registration
- **Bcrypt Password Hashing** for security

---

## 🎯 Starting Fresh?

### For Users Already Running the App
1. **Stop Expo** (if running)
2. **Follow the Quick Start Guide**: Read `QUICKSTART.md`
3. **Restart Expo** after backend is ready

### First Time Setup?
1. Start with `QUICKSTART.md` for a 5-minute setup
2. Then refer to `MONGODB_SETUP.md` for detailed configuration

---

## 📂 Documentation Files

| File | Purpose |
|------|---------|
| **QUICKSTART.md** | 5-minute quick start guide (START HERE!) |
| **MONGODB_SETUP.md** | Complete backend documentation & API reference |
| **CHANGES.md** | Summary of all changes and migrations |
| **package.json** | All dependencies and npm scripts |
| **.env.example** | Environment configuration template |

---

## 🚀 Quick Start (TL;DR)

```bash
# 1. Install dependencies
npm install

# 2. Set up MongoDB (local or Atlas)
# Local: Download from mongodb.com and run mongod

# 3. Create .env file
copy .env.example .env
# Edit .env and add your MongoDB connection

# 4. Terminal 1: Start backend
npm run server:dev

# 5. Terminal 2: Start frontend
npm start

# 6. Scan QR code with Expo Go
# Test registration → profile setup → dashboard
```

---

## 🏗️ Project Structure

```
health-app/
├── backend/                    # Express backend server
│   ├── server.js              # Main server file
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── questions.js       # Security questions
│   └── routes/
│       └── auth.js            # Authentication endpoints
│
├── src/                        # React Native frontend
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── ProfileSetupScreen.js    # NEW!
│   │   ├── ForgotPasswordScreen.js  # NEW!
│   │   ├── ProfileScreen.js
│   │   └── DashboardScreen.js
│   ├── services/
│   │   ├── authService.js     # MongoDB API client
│   │   └── api.js
│   └── context/
│       └── AuthContext.js     # Auth state management
│
├── app.json
├── App.js                      # Navigation stack
├── package.json               # Dependencies
├── .env.example               # Config template
├── QUICKSTART.md              # Quick start (READ THIS FIRST!)
├── MONGODB_SETUP.md           # Full backend docs
├── CHANGES.md                 # All changes made
└── README.md
```

---

## 🔄 User Journey

### Registration & Profile Setup
```
Registration Form
    ↓
CAPTCHA Verification
    ↓
Backend Creates User (profileCompleted: false)
    ↓
Frontend Navigates to ProfileSetupScreen
    ↓
User Selects Avatar + Enters Age/Phone
    ↓
User Answers 3 Security Questions
    ↓
Backend Hashes Answers & Sets profileCompleted: true
    ↓
Auto-Login with JWT Token
    ↓
Dashboard (HOME!)
```

### Password Reset
```
Forgot Password Link (Login Screen)
    ↓
Enter Email + CAPTCHA
    ↓
Backend Returns User's 3 Security Questions
    ↓
User Answers All Questions
    ↓
User Sets New Password
    ↓
Backend Updates & Redirects to Login
    ↓
Login with New Password ✅
```

---

## 🔐 Security Architecture

### Password Storage
- ✅ Passwords hashed with **bcryptjs** (10 salt rounds)
- ✅ Never stored in plaintext
- ✅ Never sent back from backend

### Security Questions
- ✅ Answers hashed with bcryptjs
- ✅ 10 predefined questions to choose from
- ✅ 3 random questions per user
- ✅ Case-insensitive answer matching

### Database
- ✅ MongoDB with unique email index
- ✅ ObjectId for user identification
- ✅ Automatic schema validation

### API
- ✅ CORS enabled for development
- ✅ Express error handling middleware
- ✅ Graceful MongoDB connection management

---

## 📡 Backend API

### Main Endpoints
```
POST   /api/auth/register              → Create account
POST   /api/auth/login                 → Sign in
GET    /api/auth/security-questions    → Get random 3 questions
POST   /api/auth/complete-profile      → Save profile & security answers
POST   /api/auth/update-profile        → Update existing profile
POST   /api/auth/reset-password        → Reset password with answers
GET    /api/auth/profile/:uid          → Get user profile
GET    /api/health                     → Health check
```

See `MONGODB_SETUP.md` for full endpoint documentation with request/response examples.

---

## 💾 Database Schema

### Users Collection
```javascript
{
  "_id": ObjectId,
  "email": String (unique),
  "password": String (bcrypt hashed),
  "name": String,
  "age": Number,
  "phone": String,
  "avatar": String (emoji),
  "profileCompleted": Boolean,
  "securityQuestions": [
    {
      "questionId": Number,
      "question": String,
      "answer": String (bcrypt hashed)
    }
  ],
  "createdAt": Date,
  "updatedAt": Date
}
```

---

## ⚙️ Environment Configuration

Create `.env` file in project root:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/health-app
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/health-app

# Server
PORT=3000
NODE_ENV=development
API_BASE_URL=http://localhost:3000
```

---

## 🛠️ Available Commands

```bash
# Frontend
npm start              # Start Expo dev server
npm run android        # Start on Android emulator
npm run ios           # Start on iOS simulator
npm run web           # Start web version

# Backend
npm run server        # Production mode
npm run server:dev    # Development with auto-reload

# Both (in separate terminals)
Terminal 1: npm run server:dev
Terminal 2: npm start
```

---

## 🧪 Testing Workflows

### Test 1: Full Registration Flow
1. Open app → Click **Sign Up**
2. Fill form: Name, Email, Password (8+ chars)
3. Verify CAPTCHA
4. Select avatar → Enter age/phone
5. Answer 3 security questions
6. Should reach Dashboard ✅

### Test 2: Login
1. Dashboard → Logout
2. Enter email & password
3. Verify CAPTCHA
4. Should reach Dashboard ✅

### Test 3: Forgot Password
1. Login screen → **Forgot Password?**
2. Enter email & verify CAPTCHA
3. Answer your 3 security questions
4. Set new password
5. Login with new credentials ✅

### Test 4: Profile Management
1. Dashboard → Profile button (top-right)
2. Update name/age/phone
3. See **Change Password** button
4. Update profile successfully ✅

---

## 🆘 Common Issues & Solutions

### Issue: "MongoDB connection failed"
```
Solution:
1. Verify MongoDB is running: mongod (Windows CMD)
2. Check MONGODB_URI in .env
3. For Atlas: ensure IP whitelist allows your IP
```

### Issue: "Cannot reach backend"
```
Solution:
1. Verify backend running: curl http://localhost:3000/api/health
2. Check API_BASE_URL in src/services/authService.js
3. For device: use your machine IP instead of localhost
```

### Issue: "Port 3000 already in use"
```
Solution:
1. Change PORT in .env to different number (e.g., 3001)
2. Or kill process: lsof -i :3000 (macOS/Linux)
```

### Issue: "Profile setup screen shows no questions"
```
Solution:
1. Verify backend is running
2. Check network request in app debugger
3. Review browser console for errors
```

---

## 🚀 Deployment

### Deploy Backend to Heroku
```bash
heroku create your-app-name
heroku config:set MONGODB_URI="your_atlas_uri"
git push heroku main
```

### Deploy Frontend to Expo
```bash
expo publish
# Or use EAS:
eas build --platform all
```

---

## 📚 Detailed Documentation

- **Quick Setup**: `QUICKSTART.md` (5 minutes)
- **Full Backend Docs**: `MONGODB_SETUP.md` (API, database, troubleshooting)
- **All Changes**: `CHANGES.md` (what was modified)

---

## 🎓 What You Learned

This migration teaches you:
- ✅ Building a **Node.js/Express backend**
- ✅ **MongoDB** database management
- ✅ **RESTful API** design
- ✅ **Bcrypt** for password security
- ✅ **Security questions** for account recovery
- ✅ **JWT tokens** for authentication
- ✅ **CORS** handling
- ✅ **Error handling** in backend

---

## 📞 Support

If you get stuck:
1. Check `QUICKSTART.md` for common issues
2. Review `MONGODB_SETUP.md` for detailed docs
3. Check backend logs: `npm run server:dev` output
4. Check frontend logs: Expo Go app messages
5. Use network debugger to inspect API calls

---

## ✅ Before You Start

- [ ] Have Node.js installed
- [ ] Have MongoDB installed or MongoDB Atlas account
- [ ] Have VS Code or preferred editor
- [ ] Have Expo Go app on phone/emulator
- [ ] Know your MongoDB connection string
- [ ] Read `QUICKSTART.md` first!

---

## 🎉 Next Steps

1. **Read** `QUICKSTART.md` (5 min read)
2. **Follow** the quick start steps (5 min setup)
3. **Test** all three flows (registration, login, password reset)
4. **Deploy** to production when ready

---

**Happy coding! 🚀**

For questions, check the documentation files. Everything is documented!
