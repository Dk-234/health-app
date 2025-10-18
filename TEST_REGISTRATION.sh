#!/bin/bash

echo "======================================"
echo "🔍 REGISTRATION FLOW DIAGNOSTIC TEST"
echo "======================================"
echo ""

echo "Step 1: Test Backend Server Health"
echo "Command: curl http://localhost:3000/api/health"
echo "---"
curl -s http://localhost:3000/api/health | jq . 2>/dev/null || echo "❌ Backend not responding or not running"
echo ""
echo ""

echo "Step 2: Test Security Questions Endpoint"
echo "Command: curl http://localhost:3000/api/auth/security-questions"
echo "---"
curl -s http://localhost:3000/api/auth/security-questions | jq . 2>/dev/null || echo "❌ Security questions endpoint not responding"
echo ""
echo ""

echo "Step 3: Simulate User Registration"
echo "Command: curl -X POST http://localhost:3000/api/auth/register ..."
echo "---"
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123",
    "name": "Test User"
  }' | jq . 2>/dev/null || echo "❌ Registration endpoint failed"
echo ""
echo ""

echo "======================================"
echo "✅ TEST COMPLETE"
echo "======================================"
echo ""
echo "NOTES:"
echo "✓ If Step 1 fails: Backend is not running. Run: npm run server:dev"
echo "✓ If Step 2 fails: API routes not loaded correctly"
echo "✓ If Step 3 fails: Check MongoDB connection and error messages"
echo ""
echo "NEXT STEPS:"
echo "1. Ensure npm run server:dev is running (should see: ✅ Server Running on Port 3000)"
echo "2. Check .env file has correct MONGODB_URI"
echo "3. Update API_BASE_URL in src/services/authService.js if needed"
echo "4. Run this test again to verify"
