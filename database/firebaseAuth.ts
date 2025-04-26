import { auth, firestore } from './firebaseinit';
import { useEffect, useState } from 'react';

// Register User
export const registerUser = async (email: string, password: string, name: string, phone?: string) => {
  try {
    // React Native Firebase handles persistence automatically
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Store additional user data in Firestore (excluding password)
    await firestore().collection('users').doc(user.uid).set({
      name,
      email,
      phone: phone || '',
      createdAt: new Date().toISOString(),
    });

    console.log('User registered successfully');
    return user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    // React Native Firebase handles persistence automatically
    const userCredential = await auth().signInWithEmailAndPassword(email, password);

    console.log('User logged in successfully');
    return userCredential.user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Logout User
export const logoutUser = async () => {
  try {
    await auth().signOut();  // Sign out the user
    console.log('User logged out successfully');
    return true;
  } catch (error) {
    console.error('Error logging out: ', error);
    throw error;
  }
};

// Custom hook to manage authentication state
const useAuth = () => {
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