const express = require('express');
const bcrypt = require('bcryptjs');
const { getDB } = require('../config/db');
const { getRandomQuestions, getQuestionById } = require('../config/questions');
const { generateToken, verifyToken } = require('../middleware/auth');
const {
  createDefaultPreferences,
  getPreferences
} = require('../models/Preference');
const router = express.Router();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ 
        success: false,
        error: 'Email, password, and name are required' 
      });
    }

    const db = getDB();
    const usersCollection = db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        error: 'User already exists with this email' 
      });
    }

    // Validate password
    if (password.length < 8) {
      return res.status(400).json({ 
        success: false,
        error: 'Password must be at least 8 characters' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      email,
      password: hashedPassword,
      name,
      age: null,
      phone: null,
      avatar: null,
      securityQuestions: [], // Will be filled during profile setup
      createdAt: new Date().toISOString(),
      profileCompleted: false, // Flag to track if profile setup is done
    };

    const result = await usersCollection.insertOne(user);

    res.status(201).json({
      uid: result.insertedId.toString(),
      email: user.email,
      name: user.name,
      profileCompleted: false,
      message: 'User registered successfully. Complete profile setup next.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = getDB();
    const usersCollection = db.collection('users');

    // Find user
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if profile is completed
    if (!user.profileCompleted) {
      return res.status(200).json({
        success: false,
        uid: user._id.toString(),
        email: user.email,
        name: user.name,
        profileCompleted: false,
        message: 'Please complete profile setup to continue',
      });
    }

    // Auto-initialize preferences if they don't exist
    const prefsCollection = db.collection('preferences');
    
    // Check for both ObjectId and string formats
    let existingPrefs = await prefsCollection.findOne({ userId: user._id });
    if (!existingPrefs) {
      existingPrefs = await prefsCollection.findOne({ userId: user._id.toString() });
    }
    
    if (!existingPrefs) {
      await createDefaultPreferences(user._id.toString());
      console.log(`✅ Auto-initialized preferences for user: ${user.email}`);
    } else {
      console.log(`✅ Preferences already exist for user: ${user.email}`);
    }

    const token = generateToken(user._id.toString(), user.email);
    
    res.json({
      success: true,
      uid: user._id.toString(),
      email: user.email,
      name: user.name,
      age: user.age,
      phone: user.phone,
      avatar: user.avatar,
      createdAt: user.createdAt,
      profileCompleted: true,
      token: token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Login failed' 
    });
  }
});

// Get security questions for user setup
router.get('/security-questions', async (req, res) => {
  try {
    const questions = getRandomQuestions(3);
    res.json({ questions });
  } catch (error) {
    console.error('Error fetching security questions:', error);
    res.status(500).json({ error: 'Failed to fetch security questions' });
  }
});

// Complete profile setup with security questions
router.post('/complete-profile', async (req, res) => {
  try {
    const { uid, age, phone, avatar, securityQuestions } = req.body;

    if (!uid || !securityQuestions || securityQuestions.length === 0) {
      return res.status(400).json({ error: 'UID and security questions are required' });
    }

    const db = getDB();
    const usersCollection = db.collection('users');
    const { ObjectId } = require('mongodb');

    // Hash security question answers
    const hashedQuestions = await Promise.all(
      securityQuestions.map(async (sq) => ({
        questionId: sq.questionId,
        question: sq.question,
        answer: await bcrypt.hash(sq.answer.toLowerCase(), 10), // Hash for security
      }))
    );

    // Update user profile
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(uid) },
      {
        $set: {
          age: age ? parseInt(age) : null,
          phone: phone || null,
          avatar: avatar || null,
          securityQuestions: hashedQuestions,
          profileCompleted: true,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile setup completed successfully',
      profileCompleted: true,
    });
  } catch (error) {
    console.error('Profile setup error:', error);
    res.status(500).json({ error: error.message || 'Failed to complete profile' });
  }
});

// Update user profile
router.post('/update-profile', async (req, res) => {
  try {
    const { uid, name, age, phone, avatar } = req.body;

    if (!uid) {
      return res.status(400).json({ error: 'UID is required' });
    }

    const db = getDB();
    const usersCollection = db.collection('users');
    const { ObjectId } = require('mongodb');

    const updates = {};
    if (name) updates.name = name;
    if (age) updates.age = parseInt(age);
    if (phone) updates.phone = phone;
    if (avatar) updates.avatar = avatar;
    updates.updatedAt = new Date().toISOString();

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(uid) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: error.message || 'Failed to update profile' });
  }
});

// Reset password using security questions
router.post('/reset-password', async (req, res) => {
  try {
    const { email, answers, newPassword } = req.body;

    if (!email || !answers || !newPassword) {
      return res.status(400).json({ error: 'Email, answers, and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const db = getDB();
    const usersCollection = db.collection('users');

    // Find user
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify security question answers
    let answersValid = true;
    for (let i = 0; i < answers.length; i++) {
      const userAnswer = user.securityQuestions[i];
      if (!userAnswer) {
        answersValid = false;
        break;
      }
      const isValid = await bcrypt.compare(
        answers[i].toLowerCase(),
        userAnswer.answer
      );
      if (!isValid) {
        answersValid = false;
        break;
      }
    }

    if (!answersValid) {
      return res.status(401).json({ error: 'Incorrect security question answers' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: error.message || 'Failed to reset password' });
  }
});

// Get user profile
router.get('/profile/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const db = getDB();
    const usersCollection = db.collection('users');
    const { ObjectId } = require('mongodb');

    const user = await usersCollection.findOne({ _id: new ObjectId(uid) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      uid: user._id.toString(),
      email: user.email,
      name: user.name,
      age: user.age,
      phone: user.phone,
      avatar: user.avatar,
      profileCompleted: user.profileCompleted,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: error.message || 'Failed to get profile' });
  }
});

/**
 * POST /api/auth/change-password
 * Change user password
 * Requires: Valid JWT token
 * Body: { currentPassword, newPassword, confirmPassword }
 */
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password, new password, and confirm password are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'New password and confirm password do not match'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters'
      });
    }

    // Password strength validation
    const passwordStrength = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordStrength.test(newPassword)) {
      return res.status(400).json({
        success: false,
        error: 'Password must contain uppercase, lowercase, number, and special character'
      });
    }

    const db = getDB();
    const usersCollection = db.collection('users');
    const { ObjectId } = require('mongodb');

    // Find user
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify current password
    const passwordValid = await bcrypt.compare(currentPassword, user.password);
    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date().toISOString()
        }
      }
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to change password'
    });
  }
});

/**
 * PATCH /api/auth/profile
 * Update user profile information
 * Requires: Valid JWT token
 * Body: { name, age, phone } (all optional)
 */
router.patch('/profile', verifyToken, async (req, res) => {
  try {
    const { name, age, phone } = req.body;
    const userId = req.user.userId;

    const db = getDB();
    const usersCollection = db.collection('users');
    const { ObjectId } = require('mongodb');

    // Find user
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Validate input
    const updateData = {};

    if (name !== undefined && name !== null) {
      if (typeof name !== 'string' || name.length < 2 || name.length > 50) {
        return res.status(400).json({
          success: false,
          error: 'Name must be between 2 and 50 characters'
        });
      }
      updateData.name = name.trim();
    }

    if (age !== undefined && age !== null) {
      const ageNum = parseInt(age);
      if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
        return res.status(400).json({
          success: false,
          error: 'Age must be between 13 and 120'
        });
      }
      updateData.age = ageNum;
    }

    if (phone !== undefined && phone !== null) {
      if (typeof phone !== 'string' || phone.length < 10) {
        return res.status(400).json({
          success: false,
          error: 'Phone must be at least 10 digits'
        });
      }
      // Remove non-numeric characters
      const phoneClean = phone.replace(/\D/g, '');
      if (phoneClean.length < 10) {
        return res.status(400).json({
          success: false,
          error: 'Phone must contain at least 10 digits'
        });
      }
      updateData.phone = phone.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    updateData.updatedAt = new Date().toISOString();

    // Update profile - use updateOne for reliability
    const updateResult = await usersCollection.updateOne(
      { _id: user._id },
      { $set: updateData }
    );

    // Check if update was successful
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (updateResult.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'No changes were made to the profile'
      });
    }

    // Fetch the updated user document
    const updatedUser = await usersCollection.findOne({ _id: user._id });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'Failed to retrieve updated profile'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        uid: updatedUser._id.toString(),
        email: updatedUser.email,
        name: updatedUser.name,
        age: updatedUser.age,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update profile'
    });
  }
});

module.exports = router;
