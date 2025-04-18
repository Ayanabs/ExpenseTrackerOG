import React, { useEffect } from 'react';
import { PermissionsAndroid, Alert } from 'react-native';
import Realm from 'realm';  // Import Realm to interact with the database
// @ts-ignore (Ignore TypeScript error if not using the type definition file)
import SmsListener from 'react-native-android-sms-listener';
import { Expense } from './database/expenses';
import { useRealm } from '@realm/react';

interface SmsParserProps {
  onSmsReceived: (sms: string) => void;
  onAmountExtracted: (amount: string) => void;
}

const SmsParser: React.FC<SmsParserProps> = ({ onSmsReceived, onAmountExtracted }) => {
  
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

  // Save extracted SMS and amount into Realm
  const saveToRealm = async (message: string, extractedAmount: string) => {
    try {
      const realm = useRealm();  // Open Realm with Expense schema

      // Write to Realm
      realm.write(() => {
        realm.create('Expense', {
          _id: new Realm.BSON.ObjectId(),
          amount: parseFloat(extractedAmount),
          source: 'SMS',
          date: new Date(), // Use current date for the entry
          category: 'Uncategorized', // Default category
          smsBody: message,  // Save the SMS body
        });
      });

      console.log('Expense saved to Realm!');
    } catch (error) {
      console.error('Error saving to Realm:', error);
    }
  };

  useEffect(() => {
    // Request SMS permission when the component is mounted
    requestSMSPermission();

    // Set up the SMS listener to receive incoming messages
    const subscription = SmsListener.addListener(message => {
      console.log('Received SMS:', message.body);
      
      // Pass the received SMS text to the parent component
      onSmsReceived(message.body);

      // Try to extract the amount from the received SMS
      const extractedAmount = extractAmountFromSMS(message.body);
      if (extractedAmount) {
        console.log('Extracted Amount:', extractedAmount);
        
        // Pass the extracted amount to the parent component
        onAmountExtracted(extractedAmount);

        // Save the message and extracted amount to Realm
        saveToRealm(message.body, extractedAmount);
      }
    });

    // Clean up the listener when the component is unmounted
    return () => subscription.remove();
  }, []); // Empty dependency array ensures this runs once when component is mounted

  return null; // No UI component, just handling SMS parsing
};

export default SmsParser;
