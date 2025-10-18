# Health Monitoring App - MongoDB Backend Setup Guide

## Overview
This backend provides RESTful API endpoints for the Health Monitoring React Native app, with MongoDB for data storage and security question-based password reset functionality.

## Prerequisites
- Node.js (v14+)
- MongoDB (local or MongoDB Atlas account)
- npm or yarn

## Installation Steps

### 1. Install Dependencies
```bash
cd health-app
npm install
```

### 2. MongoDB Setup

#### Option A: Local MongoDB
1. Install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB server:
   ```bash
   # Windows
   mongod
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a cluster
4. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/health-app`

### 3. Environment Configuration
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your MongoDB connection details:
   ```
   MONGODB_URI=mongodb://localhost:27017/health-app
   PORT=3000
   NODE_ENV=development
   API_BASE_URL=http://localhost:3000
   ```

### 4. Start the Backend Server

**Development mode with auto-reload:**
```bash
npm run server:dev
```

**Production mode:**
```bash
npm run server
```

Expected output:
```
╔════════════════════════════════════════╗
║  🏥 Health Monitoring App Backend     ║
║  ✅ Server Running on Port 3000      ║
║  📊 MongoDB Connected                 ║
╚════════════════════════════════════════╝
```

## API Endpoints

### Authentication

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123",
  "name": "John Doe"
}

Response:
{
  "uid": "user_id",
  "email": "user@example.com",
  "name": "John Doe",
  "profileCompleted": false,
  "message": "User registered successfully. Complete profile setup next."
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}

Response (profile not completed):
{
  "uid": "user_id",
  "email": "user@example.com",
  "name": "John Doe",
  "profileCompleted": false,
  "message": "Please complete profile setup to continue"
}

Response (profile completed):
{
  "uid": "user_id",
  "email": "user@example.com",
  "name": "John Doe",
  "age": 30,
  "phone": "+1234567890",
  "avatar": "😊",
  "createdAt": "2025-10-18T10:00:00.000Z",
  "profileCompleted": true,
  "token": "token_user_id_timestamp"
}
```

#### Get Security Questions
```
GET /api/auth/security-questions

Response:
{
  "questions": [
    {
      "id": 1,
      "question": "What is the name of your first pet?",
      "category": "personal"
    },
    ...3 random questions
  ]
}
```

#### Complete Profile Setup
```
POST /api/auth/complete-profile
Content-Type: application/json

{
  "uid": "user_id",
  "age": 30,
  "phone": "+1234567890",
  "avatar": "😊",
  "securityQuestions": [
    {
      "questionId": 1,
      "question": "What is the name of your first pet?",
      "answer": "Fluffy"
    },
    {
      "questionId": 2,
      "question": "What city were you born in?",
      "answer": "New York"
    },
    {
      "questionId": 3,
      "question": "What is your mother's maiden name?",
      "answer": "Smith"
    }
  ]
}

Response:
{
  "message": "Profile setup completed successfully",
  "profileCompleted": true
}
```

#### Update User Profile
```
POST /api/auth/update-profile
Content-Type: application/json

{
  "uid": "user_id",
  "name": "John Doe Updated",
  "age": 31,
  "phone": "+1234567890",
  "avatar": "😎"
}

Response:
{
  "message": "Profile updated successfully"
}
```

#### Reset Password (Forgot Password Flow)
```
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "answers": [
    "Fluffy",
    "New York",
    "Smith"
  ],
  "newPassword": "NewPassword123"
}

Response:
{
  "message": "Password reset successfully"
}
```

#### Get User Profile
```
GET /api/auth/profile/:uid

Response:
{
  "uid": "user_id",
  "email": "user@example.com",
  "name": "John Doe",
  "age": 30,
  "phone": "+1234567890",
  "avatar": "😊",
  "profileCompleted": true,
  "createdAt": "2025-10-18T10:00:00.000Z"
}
```

### Health Check
```
GET /api/health

Response:
{
  "status": "OK",
  "message": "Server is running"
}
```

## Database Schema

### Users Collection

```javascript
{
  "_id": ObjectId,
  "email": String (unique),
  "password": String (bcrypt hashed),
  "name": String,
  "age": Number (optional),
  "phone": String (optional),
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
  "updatedAt": Date (optional)
}
```

## Security Questions List

The backend provides 10 predefined security questions:

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

Users select 3 random questions during profile setup, and answers are hashed for security.

## Frontend Configuration

Update `src/services/authService.js` API_BASE_URL if backend is running on different host:

```javascript
const API_BASE_URL = 'http://your-server-ip:3000/api';
```

For development on the same machine:
- Android Emulator: `http://10.0.2.2:3000/api`
- iOS Simulator: `http://localhost:3000/api`
- Physical Device: `http://your-machine-ip:3000/api`

## User Flow

### Registration & Profile Setup
1. User fills registration form (name, email, password)
2. Backend creates user with `profileCompleted: false`
3. Frontend redirects to `ProfileSetupScreen`
4. User selects avatar, enters age/phone, answers 3 security questions
5. Backend hashes security answers and sets `profileCompleted: true`
6. User is auto-logged in and redirected to Dashboard

### Password Reset
1. User clicks "Forgot Password" on Login screen
2. User enters email and verifies CAPTCHA
3. Backend shows 3 random security questions from that user's profile
4. User answers all 3 questions
5. User sets new password
6. Backend verifies answers and updates password
7. User is redirected to Login screen

## Troubleshooting

### Connection Failed to MongoDB
- Ensure MongoDB is running locally or MongoDB Atlas is accessible
- Check `MONGODB_URI` in `.env` file
- Verify network connectivity

### "Port 3000 already in use"
- Change PORT in `.env` to an available port
- Or kill the process using port 3000

### CORS Issues
- CORS is enabled for all origins in development
- For production, update `cors()` in `backend/server.js` with specific domains

### Security Questions Not Showing
- Verify backend is running and accessible from frontend
- Check `API_BASE_URL` in `authService.js`
- Review network requests in browser/app debugger

## Production Deployment

### Deploy to Heroku
1. Create Heroku account and install CLI
2. From project root:
   ```bash
   heroku create your-app-name
   heroku config:set MONGODB_URI="your_mongodb_atlas_uri"
   heroku config:set NODE_ENV="production"
   git push heroku main
   ```

### Deploy to AWS EC2
1. Set up EC2 instance with Node.js
2. Install MongoDB or use MongoDB Atlas
3. Clone repository and install dependencies
4. Run with PM2 for process management
5. Configure nginx as reverse proxy

### Environment Variables for Production
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/health-app
PORT=3000
NODE_ENV=production
API_BASE_URL=https://your-domain.com/api
```

## Support
For issues or questions, check the main README.md in the project root.
