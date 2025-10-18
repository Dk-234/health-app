# Health Monitoring App - MongoDB Migration & Security Features

## 📋 Summary of Changes

### What's New
This update migrates the app from local AsyncStorage to **MongoDB** for persistent data storage, replaces email-based password reset with **security questions**, and requires **profile completion immediately after registration**.

---

## 🎯 Key Features Implemented

### 1. MongoDB Backend Integration
- **Created Express.js backend** with RESTful API endpoints
- **MongoDB database** for persistent user data storage
- All authentication operations now communicate with backend
- User data persists across app sessions via MongoDB

### 2. Security Questions System
- **Replaced email-based password reset** with security question verification
- Users answer **3 security questions during profile setup**
- Security question answers are **bcrypt hashed** for security
- Password reset requires answering security questions correctly

### 3. Post-Registration Profile Setup
- Users **must complete profile immediately after registration**
- Profile setup includes:
  - Avatar selection (10+ emoji options)
  - Age and phone number
  - Answer 3 security questions for account recovery
- After profile completion, users are **auto-logged in** to Dashboard

---

## 📁 File Structure

```
health-app/
├── backend/
│   ├── server.js                 # Express server main file
│   ├── config/
│   │   ├── db.js                 # MongoDB connection configuration
│   │   └── questions.js          # Security questions definitions
│   └── routes/
│       └── auth.js               # Authentication endpoints
├── src/
│   ├── screens/
│   │   ├── LoginScreen.js        # Updated with ForgotPassword link
│   │   ├── RegisterScreen.js     # Updated to navigate to ProfileSetup
│   │   ├── ProfileSetupScreen.js # NEW - Post-registration profile setup
│   │   ├── ForgotPasswordScreen.js # NEW - Security question based password reset
│   │   ├── ProfileScreen.js      # Updated with Change Password button
│   │   └── DashboardScreen.js    # Unchanged
│   ├── services/
│   │   └── authService.js        # Updated to use MongoDB API
│   └── context/
│       └── AuthContext.js        # Updated with completeProfile function
├── App.js                         # Updated with new screen routes
├── package.json                   # Updated with backend dependencies
├── .env.example                   # Environment configuration template
├── MONGODB_SETUP.md              # Complete backend setup guide
└── README.md                      # Main project documentation
```

---

## 🚀 Setup Instructions

### Backend Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **MongoDB Setup** (Choose one)
   
   **Option A: Local MongoDB**
   - Download from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Start MongoDB service
   
   **Option B: MongoDB Atlas (Cloud)**
   - Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Get your connection string

3. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Add your MongoDB URI:
     ```
     MONGODB_URI=mongodb://localhost:27017/health-app
     PORT=3000
     NODE_ENV=development
     ```

4. **Start Backend Server**
   ```bash
   npm run server:dev    # Development with auto-reload
   npm run server        # Production mode
   ```

### Frontend Configuration

Update `src/services/authService.js` API_BASE_URL based on your environment:

```javascript
// Development (local machine)
const API_BASE_URL = 'http://localhost:3000/api';

// Android Emulator
const API_BASE_URL = 'http://10.0.2.2:3000/api';

// Physical device
const API_BASE_URL = 'http://your-machine-ip:3000/api';
```

---

## 🔄 Updated User Flows

### Registration & Profile Setup
```
1. User fills registration form
   ↓
2. System creates user with profileCompleted: false
   ↓
3. Navigate to ProfileSetupScreen
   ↓
4. User selects avatar, enters age/phone
   ↓
5. User answers 3 security questions
   ↓
6. Backend hashes answers and sets profileCompleted: true
   ↓
7. Auto-login and navigate to Dashboard
```

### Login
```
1. User enters email & password
   ↓
2. Backend validates credentials
   ↓
3a. If profileCompleted: false → Navigate to ProfileSetupScreen
3b. If profileCompleted: true → Continue to Dashboard
```

### Password Reset
```
1. User clicks "Forgot Password" on Login screen
   ↓
2. User enters email and verifies CAPTCHA
   ↓
3. Backend returns user's 3 security questions
   ↓
4. User answers all questions
   ↓
5. User enters new password
   ↓
6. Backend verifies answers and updates password
   ↓
7. User redirected to Login with new credentials
```

---

## 📡 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/security-questions` | Fetch random security questions |
| POST | `/api/auth/complete-profile` | Complete profile setup |
| POST | `/api/auth/update-profile` | Update user profile |
| POST | `/api/auth/reset-password` | Reset password with security questions |
| GET | `/api/auth/profile/:uid` | Get user profile |
| GET | `/api/health` | Server health check |

See `MONGODB_SETUP.md` for detailed endpoint documentation.

---

## 🔐 Security Features

### Password Security
- ✅ Passwords hashed with bcrypt (10 salt rounds)
- ✅ Passwords never stored in plaintext
- ✅ Passwords never sent back from backend

### Security Questions
- ✅ Answers hashed with bcrypt
- ✅ 10 predefined questions to choose from
- ✅ 3 random questions per user
- ✅ Case-insensitive answer comparison

### Database
- ✅ MongoDB with unique email constraint
- ✅ Automatic index creation on startup
- ✅ ObjectId for user identification

---

## 🔄 Dependencies Added

### Production Dependencies
```json
{
  "axios": "^1.6.0"  // Already existed
}
```

### Development Dependencies (Backend)
```json
{
  "bcryptjs": "^2.4.3",      // Password hashing
  "cors": "^2.8.5",           // Cross-origin requests
  "dotenv": "^16.3.1",        // Environment variables
  "express": "^4.18.2",       // Web framework
  "mongodb": "^6.3.0",        // Database driver
  "nodemon": "^3.0.2"         // Development auto-reload
}
```

---

## 📝 Database Schema

### Users Collection
```javascript
{
  "_id": ObjectId,
  "email": String (unique, indexed),
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

## ✨ Security Questions Available

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

## 🛠️ Screens Modifications

### New Screens
- **ProfileSetupScreen.js**: Post-registration profile completion
- **ForgotPasswordScreen.js**: Security question-based password reset

### Modified Screens
- **LoginScreen.js**: Added "Forgot Password" link → ForgotPasswordScreen
- **RegisterScreen.js**: Auto-navigate to ProfileSetupScreen instead of Dashboard
- **ProfileScreen.js**: Added "Change Password" button → ForgotPasswordScreen
- **App.js**: Added new routes for ProfileSetup and ForgotPassword

---

## 🧪 Testing the App

### Test Registration Flow
1. Open app → Click "Sign Up"
2. Fill registration form with valid credentials
3. Verify CAPTCHA
4. Should navigate to ProfileSetupScreen
5. Select avatar, fill age/phone
6. Answer 3 security questions
7. Should auto-login and see Dashboard

### Test Login Flow
1. From Dashboard → Logout
2. Enter email and password
3. Verify CAPTCHA
4. Should login to Dashboard

### Test Password Reset
1. On Login screen → Click "Forgot Password?"
2. Enter registered email
3. Verify CAPTCHA
4. Answer 3 security questions correctly
5. Enter new password
6. Should return to Login
7. Login with new credentials

---

## ⚠️ Important Notes

1. **API Configuration**: Update `API_BASE_URL` in `src/services/authService.js` to match your backend server
2. **MongoDB Connection**: Ensure MongoDB is running before starting backend
3. **Environment Variables**: Create `.env` file with your MongoDB URI
4. **CORS**: Backend allows all origins in development (configure for production)
5. **Auto-Login**: Password is stored temporarily in AsyncStorage during registration for auto-login after profile setup

---

## 📚 Documentation

- `MONGODB_SETUP.md` - Complete backend setup and API documentation
- `package.json` - All dependencies and scripts
- `.env.example` - Environment configuration template

---

## 🔄 Migration from Local Auth

### Before (Local AsyncStorage)
```javascript
// User data stored only on device
// No backend
// Password reset via email
// Profile optional
```

### After (MongoDB)
```javascript
// User data in MongoDB
// Express backend with API
// Password reset via security questions
// Profile mandatory after registration
```

---

## 🚀 Next Steps

1. Install all dependencies: `npm install`
2. Set up MongoDB (local or Atlas)
3. Create `.env` file with MongoDB URI
4. Start backend: `npm run server:dev`
5. Update `API_BASE_URL` in auth service
6. Run frontend: `npm start`
7. Test all authentication flows

---

## 🐛 Troubleshooting

### Backend won't connect to MongoDB
- Verify MongoDB is running
- Check connection string in `.env`
- Ensure network access is allowed

### Frontend can't reach backend
- Verify backend is running on port 3000
- Check `API_BASE_URL` in `authService.js`
- Use correct IP/domain for your setup

### CAPTCHA not showing in ProfileSetup
- Ensure CaptchaComponent is working
- Check if ProfileSetupScreen imports correctly

### Password reset showing wrong questions
- Backend randomly selects 3 from 10 questions
- This is normal - questions differ each attempt

---

For detailed backend setup instructions, see **MONGODB_SETUP.md**
