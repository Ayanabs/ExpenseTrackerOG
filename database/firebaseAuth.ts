import { auth, firestore } from './firebaseinit';
import messaging from '@react-native-firebase/messaging';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useState, useEffect } from 'react';

// Configure Google Sign-In
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: '185367301858-vf9cp08me2m3ge07glujjp1hqp9m483p.apps.googleusercontent.com', // Get this from Firebase console
    offlineAccess: true,
  });
};

// Register User
export const registerUser = async (email: string, password: string, name: string, phone?: string) => {
  try {
    // React Native Firebase handles persistence automatically
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Get FCM token for the device
    let fcmToken = null;
    try {
      await messaging().registerDeviceForRemoteMessages();
      fcmToken = await messaging().getToken();
    } catch (tokenError) {
      console.error('Error getting FCM token during registration:', tokenError);
    }

    // Store additional user data in Firestore (excluding password)
    await firestore().collection('users').doc(user.uid).set({
      name,
      email,
      phone: phone || '',
      fcmToken: fcmToken || '',
      tokenUpdatedAt: fcmToken ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
    });

    console.log('User registered successfully');
    return user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Login with email and password
export const loginUser = async (email: string, password: string) => {
  try {
    // React Native Firebase handles persistence automatically
    const userCredential = await auth().signInWithEmailAndPassword(email, password);

    // Update FCM token on login
    try {
      await updateUserFCMToken(userCredential.user.uid);
    } catch (tokenError) {
      console.error('Error updating FCM token during login:', tokenError);
    }

    console.log('User logged in successfully');
    return userCredential.user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Login with Google
export const loginWithGoogle = async () => {
  try {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    // Get the users ID token
    const signInResult = await GoogleSignin.signIn();
    
    // Check if idToken exists before proceeding
    if (!signInResult.idToken) {
      throw new Error('Google Sign-In failed: No ID token received');
    }

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(signInResult.idToken);

    // Sign-in the user with the credential
    const userCredential = await auth().signInWithCredential(googleCredential);
    // Rest of your function remains the same
    // ...
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email: string) => {
  try {
    await auth().sendPasswordResetEmail(email);
    console.log('Password reset email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Update user FCM token (helper function)
const updateUserFCMToken = async (userId: string) => {
  try {
    const fcmToken = await messaging().getToken();
    
    await firestore().collection('users').doc(userId).update({
      fcmToken: fcmToken,
      tokenUpdatedAt: new Date().toISOString(),
    });
    
    console.log('FCM token updated successfully');
  } catch (error) {
    console.error('Error updating FCM token:', error);
    throw error;
  }
};

// Improved migration function (copied from your LoginScreen component)
const migrateTemporaryData = async (userId: string) => {
  try {
    // Get temporary spending limit
    const tempLimitDoc = await firestore().collection('spendingLimits').doc('temporaryUser').get();
    
    // If temporary data exists, migrate it to the user account
    if (tempLimitDoc.exists) {
      const tempLimitData = tempLimitDoc.data();
      if (tempLimitData) {
        await firestore().collection('spendingLimits').doc(userId).set({
          ...tempLimitData,
          userId: userId
        });
      }
    }
    
    // Get temporary expenses
    const tempExpenses = await firestore()
      .collection('expenses')
      .where('userId', '==', 'temporaryUser')
      .get();

    // Migrate each expense to the user account if there are any
    if (!tempExpenses.empty) {
      const batch = firestore().batch();
      tempExpenses.docs.forEach(doc => {
        const newRef = firestore().collection('expenses').doc();
        batch.set(newRef, {
          ...doc.data(),
          userId: userId
        });
      });
      
      await batch.commit();
    }

    console.log('Temporary data migrated successfully to user account');
  } catch (error) {
    console.error('Error migrating temporary data:', error);
  }
};

// Logout User
export const logoutUser = async () => {
  try {
    // Sign out from Google if signed in
    try {
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        await GoogleSignin.signOut();
      }
    } catch (error) {
      console.error('Error signing out from Google:', error);
    }
    
    // Sign out from Firebase
    await auth().signOut();
    console.log('User logged out successfully');
    return true;
  } catch (error) {
    console.error('Error logging out: ', error);
    throw error;
  }
};

// Custom hook to manage authentication state
export const useAuth = () => {
  const [user, setUser] = useState<any>(null);  // To store user state
  const [loading, setLoading] = useState(true);  // To handle loading state

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = auth().onAuthStateChanged((currentUser) => {
      if (currentUser) {
        console.log('User is signed in:', currentUser.uid);
        setUser(currentUser); // Store user info when logged in
      } else {
        console.log('User is signed out');
        setUser(null); // Clear user state when logged out
      }

      setLoading(false); // Set loading state to false after checking auth state
    });

    return () => unsubscribe();  // Clean up the listener when the component is unmounted
  }, []);

  return { user, loading };
};

export default useAuth;