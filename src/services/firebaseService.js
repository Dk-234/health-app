import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Authentication Services
export const firebaseAuthService = {
  // Register new user
  register: async (email, password, name) => {
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with display name
      await updateProfile(user, {
        displayName: name
      });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: email,
        name: name,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return {
        uid: user.uid,
        email: user.email,
        name: name,
        token: await user.getIdToken()
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw {
        code: error.code,
        message: getErrorMessage(error.code)
      };
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      return {
        uid: user.uid,
        email: user.email,
        name: userData?.name || user.displayName || 'User',
        token: await user.getIdToken()
      };
    } catch (error) {
      console.error('Login error:', error);
      throw {
        code: error.code,
        message: getErrorMessage(error.code)
      };
    }
  },

  // Logout user
  logout: async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // Reset password
  resetPassword: async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      throw {
        code: error.code,
        message: getErrorMessage(error.code)
      };
    }
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // Get user token
  getUserToken: async () => {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }
};

// Health Data Services
export const firebaseHealthService = {
  // Save health metrics
  saveHealthMetric: async (userId, metricType, value) => {
    try {
      const metricsRef = collection(db, 'users', userId, 'healthMetrics');
      await addDoc(metricsRef, {
        type: metricType,
        value: value,
        timestamp: serverTimestamp(),
        date: new Date().toISOString().split('T')[0]
      });
      return { success: true };
    } catch (error) {
      console.error('Save metric error:', error);
      throw error;
    }
  },

  // Get health metrics for a period
  getHealthMetrics: async (userId, metricType, days = 7) => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const metricsRef = collection(db, 'users', userId, 'healthMetrics');
      const q = query(
        metricsRef,
        where('type', '==', metricType),
        where('timestamp', '>=', startDate)
      );
      
      const querySnapshot = await getDocs(q);
      const metrics = [];
      querySnapshot.forEach((doc) => {
        metrics.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return metrics;
    } catch (error) {
      console.error('Get metrics error:', error);
      throw error;
    }
  },

  // Get today's summary
  getTodaySummary: async (userId) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const metricsRef = collection(db, 'users', userId, 'healthMetrics');
      const q = query(metricsRef, where('date', '==', today));
      
      const querySnapshot = await getDocs(q);
      const summary = {
        steps: 0,
        heartRate: 0,
        sleep: 0,
        calories: 0
      };
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (summary.hasOwnProperty(data.type)) {
          summary[data.type] = data.value;
        }
      });
      
      return summary;
    } catch (error) {
      console.error('Get summary error:', error);
      throw error;
    }
  },

  // Update user profile
  updateUserProfile: async (userId, updates) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // Get user profile
  getUserProfile: async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }
};

// Helper function to get user-friendly error messages
const getErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please login instead.';
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use a stronger password.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential':
      return 'Invalid credentials. Please check your email and password.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    default:
      return 'An error occurred. Please try again.';
  }
};

export default {
  auth: firebaseAuthService,
  health: firebaseHealthService
};
