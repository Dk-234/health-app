# Backend API Documentation

This document provides the expected RESTful API endpoints for the Health Monitoring App backend.

## Base URL
```
https://your-api-backend.com/api
```

## Authentication

### 1. Login
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "captchaToken": "abc123"
}
```

**Response (Success - 200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-10-17T10:00:00Z"
  }
}
```

**Response (Error - 401):**
```json
{
  "error": "Invalid credentials",
  "message": "Email or password is incorrect"
}
```

---

### 2. Register
**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "SecurePass123",
  "captchaToken": "abc123"
}
```

**Response (Success - 201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Response (Error - 400):**
```json
{
  "error": "Registration failed",
  "message": "Email already exists"
}
```

---

### 3. Reset Password
**Endpoint:** `POST /auth/reset-password`

**Request Body:**
```json
{
  "email": "user@example.com",
  "captchaToken": "abc123"
}
```

**Response (Success - 200):**
```json
{
  "message": "Password reset link sent to email",
  "success": true
}
```

---

### 4. Verify CAPTCHA
**Endpoint:** `POST /auth/verify-captcha`

**Request Body:**
```json
{
  "captchaToken": "abc123"
}
```

**Response (Success - 200):**
```json
{
  "valid": true,
  "message": "CAPTCHA verified successfully"
}
```

---

## Health Data Endpoints

### 1. Get Health Metrics
**Endpoint:** `GET /health/metrics`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (Success - 200):**
```json
{
  "steps": 8547,
  "heartRate": 72,
  "sleep": 7.5,
  "calories": 2341,
  "lastUpdated": "2025-10-17T15:30:00Z"
}
```

---

### 2. Get Heart Rate Data
**Endpoint:** `GET /health/heart-rate?period=7d`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `period`: `7d` | `30d` | `90d`

**Response (Success - 200):**
```json
{
  "period": "7d",
  "data": [
    {
      "date": "2025-10-11",
      "value": 68,
      "label": "Mon"
    },
    {
      "date": "2025-10-12",
      "value": 72,
      "label": "Tue"
    },
    {
      "date": "2025-10-13",
      "value": 75,
      "label": "Wed"
    },
    {
      "date": "2025-10-14",
      "value": 70,
      "label": "Thu"
    },
    {
      "date": "2025-10-15",
      "value": 73,
      "label": "Fri"
    },
    {
      "date": "2025-10-16",
      "value": 71,
      "label": "Sat"
    },
    {
      "date": "2025-10-17",
      "value": 72,
      "label": "Sun"
    }
  ],
  "average": 71.57,
  "min": 68,
  "max": 75
}
```

---

### 3. Get Steps Data
**Endpoint:** `GET /health/steps?period=7d`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `period`: `7d` | `30d` | `90d`

**Response (Success - 200):**
```json
{
  "period": "7d",
  "data": [
    {
      "date": "2025-10-11",
      "value": 7500,
      "label": "Mon"
    },
    {
      "date": "2025-10-12",
      "value": 8200,
      "label": "Tue"
    },
    {
      "date": "2025-10-13",
      "value": 9100,
      "label": "Wed"
    },
    {
      "date": "2025-10-14",
      "value": 7800,
      "label": "Thu"
    },
    {
      "date": "2025-10-15",
      "value": 8900,
      "label": "Fri"
    },
    {
      "date": "2025-10-16",
      "value": 10200,
      "label": "Sat"
    },
    {
      "date": "2025-10-17",
      "value": 8547,
      "label": "Sun"
    }
  ],
  "total": 60247,
  "average": 8606,
  "goal": 10000
}
```

---

### 4. Get Sleep Data
**Endpoint:** `GET /health/sleep?period=7d`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `period`: `7d` | `30d` | `90d`

**Response (Success - 200):**
```json
{
  "period": "7d",
  "data": [
    {
      "date": "2025-10-11",
      "hours": 7.2,
      "quality": "good"
    },
    {
      "date": "2025-10-12",
      "hours": 6.8,
      "quality": "fair"
    },
    {
      "date": "2025-10-13",
      "hours": 8.1,
      "quality": "excellent"
    },
    {
      "date": "2025-10-14",
      "hours": 7.5,
      "quality": "good"
    },
    {
      "date": "2025-10-15",
      "hours": 7.0,
      "quality": "good"
    },
    {
      "date": "2025-10-16",
      "hours": 8.3,
      "quality": "excellent"
    },
    {
      "date": "2025-10-17",
      "hours": 7.5,
      "quality": "good"
    }
  ],
  "average": 7.49,
  "goal": 8.0
}
```

---

### 5. Get Calories Data
**Endpoint:** `GET /health/calories?period=7d`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `period`: `7d` | `30d` | `90d`

**Response (Success - 200):**
```json
{
  "period": "7d",
  "data": [
    {
      "date": "2025-10-11",
      "burned": 2200,
      "consumed": 2100
    },
    {
      "date": "2025-10-12",
      "burned": 2350,
      "consumed": 2300
    },
    {
      "date": "2025-10-13",
      "burned": 2450,
      "consumed": 2200
    },
    {
      "date": "2025-10-14",
      "burned": 2180,
      "consumed": 2050
    },
    {
      "date": "2025-10-15",
      "burned": 2400,
      "consumed": 2250
    },
    {
      "date": "2025-10-16",
      "burned": 2550,
      "consumed": 2400
    },
    {
      "date": "2025-10-17",
      "burned": 2341,
      "consumed": 2150
    }
  ],
  "totalBurned": 16471,
  "totalConsumed": 15450
}
```

---

### 6. Update Health Metric
**Endpoint:** `POST /health/metrics`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "metricType": "steps",
  "value": 8547,
  "timestamp": "2025-10-17T15:30:00Z"
}
```

**Response (Success - 201):**
```json
{
  "message": "Metric updated successfully",
  "metric": {
    "id": 123,
    "type": "steps",
    "value": 8547,
    "timestamp": "2025-10-17T15:30:00Z"
  }
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 400 Bad Request
```json
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong on the server"
}
```

---

## Authentication Flow

1. User enters credentials on login screen
2. User verifies CAPTCHA
3. App sends POST request to `/auth/login` with email, password, and captchaToken
4. Backend validates credentials and CAPTCHA
5. Backend returns JWT token and user data
6. App stores token in AsyncStorage
7. All subsequent API requests include `Authorization: Bearer {token}` header
8. Token is automatically added by axios interceptor

---

## Implementation Notes

- All authenticated endpoints require a valid JWT token in the Authorization header
- Tokens should be stored securely using AsyncStorage
- CAPTCHA tokens should be validated on the server side
- Password should be hashed using bcrypt or similar
- Implement rate limiting for authentication endpoints
- Use HTTPS in production
- Implement token refresh mechanism for long-term sessions
- Add request validation middleware
- Log all authentication attempts
