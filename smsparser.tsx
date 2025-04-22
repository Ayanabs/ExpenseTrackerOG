import { useEffect } from 'react';
import { PermissionsAndroid, Alert } from 'react-native';
import SmsListener from 'react-native-android-sms-listener'; // Ensure SMS listener is installed
import firestore from '@react-native-firebase/firestore'; // Import Firestore for data handling

interface SmsParserProps {
  onSmsReceived: (sms: string) => void;
  onAmountExtracted: (amount: string) => void;
  setTotalSpent?: React.Dispatch<React.SetStateAction<number>>; // Optional prop for updating total spent
}

const SmsParser: React.FC<SmsParserProps> = ({ onSmsReceived, onAmountExtracted, setTotalSpent }) => {

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
    try {
      const amount = parseFloat(extractedAmount);
      console.log('Amount to be saved to Firestore:', amount);

      // Fetch the current spending limit period from Firestore (you can adjust this if needed)
      const currentPeriodDoc = await firestore().collection('spendingLimits').doc('currentLimit').get();
      if (!currentPeriodDoc.exists) {
        console.error('No current spending period found!');
        return;
      }

      const currentPeriod = currentPeriodDoc.data();
      if (!currentPeriod) {
        console.error('No data found for the spending period!');
        return;
      }

      // Add the expense to Firestore
      await firestore().collection('expenses').add({
        amount,             // Amount extracted from SMS
        source: 'SMS',      // Source is 'SMS'
        date: firestore.Timestamp.fromDate(new Date()),  // Current date
        category: 'SMS',    // Category is 'SMS'
        period: currentPeriod, // Add the current spending period
      });

      // If total spent needs to be updated, calculate the total spent here
      if (setTotalSpent) {
        const totalSpentInPeriod = await calculateTotalSpentWithinPeriod(currentPeriod);
        setTotalSpent(parseFloat(totalSpentInPeriod.toFixed(2) ?? '0.00')); // Update total spent in parent
        console.log('Total spent after SMS expense:', totalSpentInPeriod);
      }
    } catch (error) {
      console.error('Error saving SMS expense to Firestore:', error);
    }
  };

  // Calculate total spent within the spending period
  const calculateTotalSpentWithinPeriod = async (currentPeriod: any) => {
    try {
      // Fetch expenses within the current spending period from Firestore
      const snapshot = await firestore().collection('expenses')
        .where('date', '>=', currentPeriod.startDate)
        .where('date', '<=', currentPeriod.endDate)
        .get();

      const expenses = snapshot.docs.map(doc => doc.data());
      const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      return totalSpent;
    } catch (error) {
      console.error('Error calculating total spent within the period:', error);
      return 0;
    }
  };

  useEffect(() => {
    // Request SMS permission when the component is mounted
    requestSMSPermission();

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
  }, [onSmsReceived, onAmountExtracted]);

  return null;  // Nothing to render for this component
};

export default SmsParser;
