const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./config/db');
const authRoutes = require('./routes/auth');
const preferencesRoutes = require('./routes/preferences');
const { initializePreferencesCollection } = require('./models/Preference');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', preferencesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Initialize preferences collection
    await initializePreferencesCollection();

    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║  🏥 Health Monitoring App Backend     ║
║  ✅ Server Running on Port ${PORT}      ║
║  📊 MongoDB Connected                 ║
╚════════════════════════════════════════╝
      `);
      console.log(`
Available Endpoints:
  POST   /api/auth/register              - Register new user
  POST   /api/auth/login                 - Login user
  GET    /api/auth/security-questions    - Get random security questions
  POST   /api/auth/complete-profile      - Complete profile setup
  POST   /api/auth/update-profile        - Update user profile
  POST   /api/auth/reset-password        - Reset password with security questions
  GET    /api/auth/profile/:uid          - Get user profile
  GET    /api/health                     - Health check
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  const { closeDB } = require('./config/db');
  await closeDB();
  process.exit(0);
});

startServer();
