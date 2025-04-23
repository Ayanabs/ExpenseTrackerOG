// firebaseAuth.ts
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, setDoc, doc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

// Initialize Firebase app
const firebaseConfig = {
  apiKey: "AIzaSyB9fJLiTaJtZ2tn2fCGvuuKI-SXqGSiUbY",
  projectId: "expensetracker-e1",
  // Add other config values as needed
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Register User
export const registerUser = async (email: string, password: string, name: string, phone?: string) => {
  if (!email || !password || !name) {
    throw new Error('Email, password, and name are required');
  }

  console.log('Attempting to register with email:', email);

  try {
    // Register the user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store additional user data in Firestore, but NOT the password
    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      phone: phone || '',  // Phone is optional
      createdAt: new Date().toISOString()
    });

    console.log('User registered successfully');
    return user;  // Returning the user data
  } catch (error) {
    console.error('Error registering user: ', (error as Error).message);
    
    // Provide more user-friendly error messages
    if ((error as any).code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered. Please log in instead.');
    } else if ((error as any).code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please use at least 6 characters.');
    } else if ((error as any).code === 'auth/invalid-email') {
      throw new Error('Invalid email address format.');
    } else {
      throw error; // Throw original error for other cases
    }
  }
};

// Login User
export const loginUser = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  console.log('Attempting to log in with email:', email);

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log('User logged in successfully');
    return user;  // Returning the authenticated user
  } catch (error) {
    console.error('Error logging in: ', (error as Error).message);
    
    // Provide more user-friendly error messages
    if ((error as any).code === 'auth/user-not-found' || (error as any).code === 'auth/wrong-password') {
      throw new Error('Invalid email or password. Please try again.');
    } else if ((error as any).code === 'auth/invalid-email') {
      throw new Error('Invalid email address format.');
    } else if ((error as any).code === 'auth/too-many-requests') {
      throw new Error('Too many failed login attempts. Please try again later.');
    } else {
      throw error;  // Throw original error for other cases
    }
  }
};

// Logout User
export const logoutUser = async () => {
  try {
    await signOut(auth);  // Sign out the user
    console.log('User logged out successfully');
    return true;
  } catch (error) {
    console.error('Error logging out: ', (error as Error).message);
    throw error;
  }
};