import { useEffect, useState } from 'react';
import { PermissionsAndroid, Alert } from 'react-native';
import SmsListener from 'react-native-android-sms-listener';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';  // Import Firebase auth directly

interface SmsParserProps {
  onSmsReceived: (sms: string) => void;
  onAmountExtracted: (amount: string) => void;
  setTotalSpent?: React.Dispatch<React.SetStateAction<number>>;
}

const SmsParser: React.FC<SmsParserProps> = ({ onSmsReceived, onAmountExtracted, setTotalSpent }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Request SMS permission from the user
  const requestSMSPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
        {
          title: 'SMS Permission',
          message: 'This app needs access to read your SMS messages.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('SMS Permission Granted');
      } else {
        console.log('SMS Permission Denied');
        Alert.alert('Permission Denied', 'You need to allow SMS permission for this feature.');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  // Function to extract amount from the SMS text
  const extractAmountFromSMS = (text: string): string | null => {
    const match = text.match(/Rs\.\s?(\d+(\.\d{1,2})?)/); // This matches amount with "Rs."
    return match ? match[1] : null; // Return extracted amount or null if not found
  };

  // Save extracted SMS and amount into Firestore
  const saveToFirestore = async (message: string, extractedAmount: string) => {
    if (!currentUser) {
      console.error('No user is signed in');
      return;
    }

    try {
      const amount = parseFloat(extractedAmount);
      console.log('Amount to be saved to Firestore:', amount);

      // Get the current spending limit period from Firestore
      const spendingLimitDoc = await firestore().collection('spendingLimits').doc(currentUser.uid).get();

      if (!spendingLimitDoc.exists) {
        console.error('No spending limit found for this user');
        return;
      }

      const spendingLimitData = spendingLimitDoc.data();
      if (!spendingLimitData) {
        console.error('No data found in the spending limit document');
        return;
      }

      // Add the expense to Firestore with userId
      await firestore().collection('expenses').add({
        amount,
        source: 'SMS',
        date: firestore.Timestamp.fromDate(new Date()),
        category: 'SMS',
        userId: currentUser.uid, // Add the user ID to filter expenses correctly
        description: message.slice(0, 100), // Store the first 100 chars of the SMS as description
      });

      console.log('SMS expense saved successfully to Firestore');

      // No need to manually update totalSpent here as the listener in Homepage will handle it
    } catch (error) {
      console.error('Error saving SMS expense to Firestore:', error);
    }
  };

  // Get the current user from Firebase Auth
  const getCurrentUser = () => {
    const user = auth().currentUser; // Call auth() inside the component or hook
    setCurrentUser(user);  // Store the current user in state
  };

  useEffect(() => {
    // Request SMS permission when the component is mounted
    requestSMSPermission();

    // Fetch the current user when the component mounts
    getCurrentUser();

    // Set up the SMS listener to receive incoming messages
    const subscription = SmsListener.addListener(message => {
      console.log('Received SMS:', message.body);

      onSmsReceived(message.body);  // Pass received SMS text to the parent component
      const extractedAmount = extractAmountFromSMS(message.body);
      if (extractedAmount) {
        console.log('Extracted Amount:', extractedAmount);

        // Pass the extracted amount to the parent component
        onAmountExtracted(extractedAmount);

        // Save the message and extracted amount to Firestore
        saveToFirestore(message.body, extractedAmount);
      }
    });

    // Clean up the listener when the component is unmounted
    return () => subscription.remove();
  }, [onSmsReceived, onAmountExtracted]); // Make sure these functions are passed as props and stay consistent

  return null;  // Nothing to render for this component
};

export default SmsParser;
