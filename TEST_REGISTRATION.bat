@echo off
REM ====================================
REM Registration Flow Diagnostic Test
REM ====================================

echo.
echo ======================================
echo 🔍 REGISTRATION FLOW DIAGNOSTIC TEST
echo ======================================
echo.

echo Step 1: Test Backend Server Health
echo Command: curl http://localhost:3000/api/health
echo ---
curl -s http://localhost:3000/api/health 2>nul || echo ❌ Backend not responding or not running
echo.
echo.

echo Step 2: Test Security Questions Endpoint
echo Command: curl http://localhost:3000/api/auth/security-questions
echo ---
curl -s http://localhost:3000/api/auth/security-questions 2>nul || echo ❌ Security questions endpoint not responding
echo.
echo.

echo Step 3: Simulate User Registration (Test User)
echo Command: curl -X POST http://localhost:3000/api/auth/register ...
echo ---
curl -s -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"test@example.com\", \"password\": \"TestPassword123\", \"name\": \"Test User\"}" 2>nul || echo ❌ Registration endpoint failed
echo.
echo.

echo ======================================
echo ✅ TEST COMPLETE
echo ======================================
echo.
echo NOTES:
echo  - If Step 1 fails: Backend is not running. Run: npm run server:dev
echo  - If Step 2 fails: API routes not loaded correctly
echo  - If Step 3 fails: Check MongoDB connection and error messages
echo.
echo NEXT STEPS:
echo  1. Ensure npm run server:dev is running
echo  2. Check .env file has correct MONGODB_URI
echo  3. Update API_BASE_URL in src/services/authService.js if needed
echo  4. Run this test again to verify
echo.
pause
