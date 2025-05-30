import { initializeApp, getApps } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';


const firebaseConfig = {
  apiKey: 'AIzaSyB9fJLiTaJtZ2tn2fCGvuuKI-SXqGSiUbY',
  projectId: 'expensetracker-e1',
  appId: '1:185367301858:android:cef694aa910219b5dfd8bb'
};

// Initialize Firebase if it hasn't been initialized yet
export const initializeFirebase = () => {
  if (getApps().length === 0) {
   
    initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  } else {
    console.log('Firebase already initialized');
  }
};


export { auth, firestore, messaging };