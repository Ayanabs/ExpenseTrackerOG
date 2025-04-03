import React, { useState, useEffect } from 'react';
import { PermissionsAndroid, Alert } from 'react-native';
// @ts-ignore (Ignore TypeScript error if not using the type definition file)
import SmsListener from 'react-native-android-sms-listener';

interface SmsParserProps {
  onSmsReceived: (sms: string) => void;
  onAmountExtracted: (amount: string) => void;
}

const SmsParser: React.FC<SmsParserProps> = ({ onSmsReceived, onAmountExtracted }) => {
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

  const extractAmountFromSMS = (text: string): string | null => {
    const match = text.match(/Rs\.\s?(\d+(\.\d{1,2})?)/);
    return match ? match[1] : null;
  };

  useEffect(() => {
    requestSMSPermission();

    const subscription = SmsListener.addListener(message => {
      console.log('Received SMS:', message);
      onSmsReceived(message.body); // Pass received SMS to parent component

      const extractedAmount = extractAmountFromSMS(message.body);
      if (extractedAmount) {
        console.log('Extracted Amount:', extractedAmount);
        onAmountExtracted(extractedAmount); // Pass extracted amount to parent component
      }
    });

    return () => subscription.remove(); // Cleanup on unmount
  }, []);

  return null; // No UI component, just handling SMS parsing
};

export default SmsParser;
