import { useEffect, useState } from 'react';
import { PermissionsAndroid, Alert, AppState, Platform } from 'react-native';
import BackgroundService from 'react-native-background-actions';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { AppRegistry } from 'react-native';

interface SmsParserProps {
  onSmsReceived: (sms: string, sender?: string) => void;
  onAmountExtracted: (amount: string, sender?: string) => void;
  setTotalSpent?: React.Dispatch<React.SetStateAction<number>>;
}


interface SmsData {
  body: string;
  sender: string;
  timestamp?: number;
}


let isProcessingSms = false;
const processingMessages = new Set<string>();

//sender id
const saveToFirestore = async (message: string, extractedAmount: string, sender: string = 'Unknown') => {
  try {
    console.log('=== FIRESTORE SAVE ATTEMPT START ===');
    console.log('Message length:', message.length);
    console.log('Extracted amount:', extractedAmount);
    console.log('SMS Sender:', sender);

    // Check authentication status
    const currentUser = auth().currentUser;
    if (!currentUser) {
      console.error('❌ No authenticated user found');
      throw new Error('User not authenticated');
    }

    console.log(' User authenticated:', currentUser.uid);

    // Validate and parse amount
    const amount = parseFloat(extractedAmount);
    if (isNaN(amount) || amount <= 0) {
      console.error('❌ Invalid amount:', extractedAmount);
      throw new Error('Invalid amount extracted');
    }

    console.log(' Amount validated:', amount);

    // Create message hash for duplicate prevention (include sender in hash)
    const messageHash = hashMessage(message + sender);
    console.log(' Message hash created:', messageHash);

    // Check if already processing this message
    if (processingMessages.has(messageHash)) {
      console.log(' Message already being processed, skipping');
      return null;
    }

    processingMessages.add(messageHash);

    try {
      
      const currentDate = new Date();
      const expenseData = {
        amount,
        source: `SMS - ${sender}`, 
        date: firestore.Timestamp.fromDate(currentDate),
        category: 'SMS',
        userId: currentUser.uid,
        description: message.slice(0, 100),
        messageHash: messageHash,
        createdAt: firestore.Timestamp.fromDate(currentDate),
        rawMessage: message.slice(0, 500),
        smsSender: sender, 
        senderCategory: categorizeSender(sender), 
        appVersion: '1.0.0',
        platform: Platform.OS,
        processingTimestamp: Date.now(),
      };

      console.log(' Attempting atomic save with transaction...');

      // check for duplicates outside of transaction
      const duplicateCheck = await firestore()
        .collection('expenses')
        .where('messageHash', '==', messageHash)
        .where('userId', '==', currentUser.uid)
        .limit(1)
        .get();

      if (!duplicateCheck.empty) {
        console.log('Duplicate message found, skipping save');
        throw new Error('DUPLICATE_MESSAGE');
      }

      const result = await firestore().runTransaction(async (transaction) => {
        // Create new document reference
        const newDocRef = firestore().collection('expenses').doc();
        
        // Set the document within transaction
        transaction.set(newDocRef, expenseData);
        
        return newDocRef.id;
      });

      console.log('Document saved successfully with transaction, ID:', result);
      console.log('=== FIRESTORE SAVE ATTEMPT END ===');
      return result;

    } catch (transactionError: any) {
      if (transactionError.message === 'DUPLICATE_MESSAGE') {
        console.log(' Duplicate message detected in transaction');
        return null;
      }
      throw transactionError;
    } finally {
      processingMessages.delete(messageHash);
    }

  } catch (error: any) {
    console.error('=== FIRESTORE SAVE ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('=== FIRESTORE SAVE ERROR END ===');
    processingMessages.delete(hashMessage(message + sender));
    throw error;
  }
};

// New function to categorize SMS senders
const categorizeSender = (sender: string): string => {
  const bankPatterns = [
    /HDFC/i, /ICICI/i, /SBI/i, /AXIS/i, /KOTAK/i, /PNB/i, /BOB/i, /CANARA/i,
    /UNION/i, /INDIAN/i, /CENTRAL/i, /SYNDICATE/i, /ALLAHABAD/i, /ANDHRA/i,
    /BANK/i, /PAYTM/i, /GPAY/i, /PHONEPE/i, /AMAZON/i, /FLIPKART/i
  ];
  
  const creditCardPatterns = [
    /CREDIT/i, /CARD/i, /CC/i, /VISA/i, /MASTER/i, /AMEX/i, /RUPAY/i
  ];
  
  const upiPatterns = [
    /UPI/i, /PAYTM/i, /GPAY/i, /PHONEPE/i, /BHIM/i, /AMAZONPAY/i
  ];

  for (const pattern of bankPatterns) {
    if (pattern.test(sender)) return 'Bank';
  }
  
  for (const pattern of creditCardPatterns) {
    if (pattern.test(sender)) return 'Credit Card';
  }
  
  for (const pattern of upiPatterns) {
    if (pattern.test(sender)) return 'UPI/Wallet';
  }
  
  return 'Other';
};


const backgroundSmsTask = async (taskData: any) => {
  console.log('🔧 Background SMS task started:', taskData);

  if (!taskData || !taskData.message) {
    console.log(' No valid message data in background task');
    return;
  }

  const { body, sender } = taskData.message;
  if (!body) {
    console.log(' No message body in background task');
    return;
  }

  
  if (isProcessingSms) {
    console.log('SMS already being processed, skipping background task');
    return;
  }

  try {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      console.error('❌ No authenticated user in background task');
      return;
    }

    const extractedAmount = extractAmountFromSMS(body);
    if (extractedAmount) {
      console.log('Background task extracted amount:', extractedAmount, 'from sender:', sender);
      const docId = await saveToFirestore(body, extractedAmount, sender || 'Unknown');
      if (docId) {
        console.log(' Background SMS processing completed, document ID:', docId);
      } else {
        console.log('Background SMS processing completed but no document ID returned (likely duplicate)');
      }
    } else {
      console.log(' No amount found in background SMS from', sender, ':', body.substring(0, 50));
    }
  } catch (error) {
    console.error('Error in background SMS task:', error);
  }
};

// Enhanced amount extraction with more patterns
const extractAmountFromSMS = (text: string): string | null => {
  console.log('🔍 Extracting amount from SMS text:', text.substring(0, 100));
  
  const patterns = [
    /Rs\.?\s?(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i,
    
    /amount\s*[:\-]?\s*Rs\.?\s?(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i,
    /debited\s*[:\-]?\s*Rs\.?\s?(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i,
    /spent\s*[:\-]?\s*Rs\.?\s?(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i,
    /charged\s*[:\-]?\s*Rs\.?\s?(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i,
    /withdrawn\s*[:\-]?\s*Rs\.?\s?(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i,
    /paid\s*[:\-]?\s*Rs\.?\s?(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const cleanAmount = match[1].replace(/,/g, '');
      console.log('Amount extracted using pattern:', pattern.toString(), 'Result:', cleanAmount);
      return cleanAmount;
    }
  }

  console.log(' No amount pattern matched in SMS');
  return null;
};


const hashMessage = (messageWithSender: string): string => {
  
  const timeWindow = Math.floor(Date.now() / (5 * 60 * 1000));
  const content = messageWithSender + timeWindow.toString();
  
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

// Register the headless task
AppRegistry.registerHeadlessTask('BACKGROUND_SMS_TASK', () => backgroundSmsTask);

const SmsParser: React.FC<SmsParserProps> = ({ onSmsReceived, onAmountExtracted, setTotalSpent }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [appState, setAppState] = useState(AppState.currentState);

  const requestSMSPermission = async () => {
    try {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS, 
        PermissionsAndroid.PERMISSIONS.READ_SMS
      ];
      
      if (Number(Platform.Version) >= 33) {
        permissions.push(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      }
      
      const results = await Promise.all(
        permissions.map(permission => 
          PermissionsAndroid.request(permission, {
            title: permission.includes('NOTIFICATIONS') ? 'Notification Permission' : 'SMS Permission',
            message: permission.includes('NOTIFICATIONS') 
              ? 'This app needs to show notifications for background operation.'
              : 'This app needs access to read your SMS messages.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          })
        )
      );
      
      const allGranted = results.every(result => result === PermissionsAndroid.RESULTS.GRANTED);
      
      if (allGranted) {
        console.log('All SMS permissions granted');
        return true;
      } else {
        console.log('Some SMS permissions denied');
        Alert.alert('Permission Denied', 'You need to allow all permissions for this feature to work.');
        return false;
      }
    } catch (err) {
      console.warn('Error requesting SMS permissions:', err);
      return false;
    }
  };

  const getCurrentUser = () => {
    const user = auth().currentUser;
    setCurrentUser(user);
    console.log('👤 Current user updated:', user?.uid || 'No user');
  };

  const backgroundServiceOptions = {
    taskName: 'SMS Background Service',
    taskTitle: 'SMS Monitoring',
    taskDesc: 'Monitoring for spending SMS notifications',
    taskIcon: {
      name: 'ic_launcher',
      type: 'mipmap',
    },
    color: '#ffffff',
    linkingURI: 'yourapp://sms',
    parameters: {
      delay: 1000,
    },
  };
  
  const backgroundTask = async (taskDataArguments: any) => {
    await new Promise(async (resolve) => {
      const updateNotification = () => {
        BackgroundService.updateNotification({
          taskDesc: 'Monitoring for SMS messages...',
        });
      };
      
      setInterval(updateNotification, 5000);
    });
  };

  const startBackgroundService = async () => {
    try {
      // FIXED: Always stop existing service first
      if (await BackgroundService.isRunning()) {
        console.log(' Stopping existing background service');
        await BackgroundService.stop();
        await new Promise(resolve => setTimeout(resolve, 1000)); 
      }

      console.log('Starting fresh background service for SMS monitoring');
      await BackgroundService.start(backgroundTask, backgroundServiceOptions);
      console.log('Background service started successfully');
      
    } catch (error) {
      console.error('Failed to start background service:', error);
    }
  };

  const stopBackgroundService = async () => {
    try {
      if (await BackgroundService.isRunning()) {
        await BackgroundService.stop();
        console.log(' Background service stopped');
      }
    } catch (error) {
      console.error('Failed to stop background service:', error);
    }
  };

  const handleAppStateChange = (nextAppState: string) => {
    console.log(' App state changing from', appState, 'to', nextAppState);
    
    if (appState.match(/active|foreground/) && nextAppState.match(/inactive|background/)) {
      console.log('App going to background, ensuring background service is running');
      startBackgroundService();
    }
    
    setAppState(nextAppState as typeof AppState.currentState);
  };


  const processSmsMessage = async (smsData: SmsData, source: string = 'foreground') => {
    const { body: messageBody, sender } = smsData;
    
    // CRITICAL: Global processing lock
    if (isProcessingSms) {
      console.log(` Already processing an SMS, skipping ${source} message from ${sender}`);
      return;
    }

    const messageHash = hashMessage(messageBody + sender);
    if (processingMessages.has(messageHash)) {
      console.log(` Message with hash ${messageHash} already being processed, skipping ${source} from ${sender}`);
      return;
    }

    isProcessingSms = true;

    try {
      console.log(` Processing SMS from ${source} | Sender: ${sender} | Message:`, messageBody.substring(0, 100));
      
      // Check if user is authenticated
      if (!currentUser) {
        console.error('Cannot process SMS: No authenticated user');
        return;
      }
      
      // Call callbacks with sender information
      onSmsReceived(messageBody, sender);
      
      const extractedAmount = extractAmountFromSMS(messageBody);
      
      if (extractedAmount) {
        console.log(` Amount extracted from ${source} SMS (${sender}):`, extractedAmount);
        
        // Call the callback with sender information
        onAmountExtracted(extractedAmount, sender);
        
        // Save to Firestore with comprehensive error handling
        try {
          const docId = await saveToFirestore(messageBody, extractedAmount, sender);
          
          if (docId) {
            console.log(` ${source} SMS processing completed successfully, document ID:`, docId);
          } else {
            console.log(` ${source} SMS processing completed but no document ID returned (likely duplicate)`);
          }
        } catch (saveError) {
          console.error(` Failed to save ${source} SMS to Firestore:`, saveError);
          
          Alert.alert(
            'Save Error',
            'Failed to save SMS expense. Please check your internet connection.',
            [{ text: 'OK' }]
          );
        }
      } else {
        console.log(`No amount found in ${source} SMS from ${sender}:`, messageBody.substring(0, 50));
      }
    } catch (error) {
      console.error(` Error processing ${source} SMS from ${sender}:`, error);
    } finally {
      // CRITICAL: Always release the lock
      isProcessingSms = false;
    }
  };

  useEffect(() => {
    console.log(' SmsParser component initializing...');
    
    // Request necessary permissions
    requestSMSPermission();
    
    // Get the current user
    getCurrentUser();

    // Set up app state change handler
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    
    const eventEmitter = Platform.select({
      android: require('react-native').DeviceEventEmitter,
      default: null
    });

    let eventSubscription: any = null;
    
    if (eventEmitter) {
      console.log('📡 Setting up ENHANCED SMS event listener with sender tracking...');
      
      eventSubscription = eventEmitter.addListener('sms_received', (event: any) => {
        console.log(' Received SMS event from DeviceEventEmitter:', {
          sender: event?.sender || 'Unknown',
          bodyLength: event?.body?.length || 0,
          timestamp: new Date().toISOString()
        });
        
        if (event && event.body) {
          const smsData: SmsData = {
            body: event.body,
            sender: event.sender || 'Unknown',
            timestamp: event.timestamp || Date.now()
          };
          
          processSmsMessage(smsData, 'DeviceEventEmitter');
        } else {
          console.log(' Invalid SMS event received:', event);
        }
      });
      
      console.log('Enhanced SMS event listener set up successfully');
    } else {
      console.log(' EventEmitter not available on this platform');
    }

    // Start background service for when app is not active
    console.log('🔧 Starting background service on component mount...');
    startBackgroundService();

    // Background service health check
    const backgroundServiceCheck = setInterval(async () => {
      try {
        const isRunning = await BackgroundService.isRunning();
        if (!isRunning && appState.match(/inactive|background/)) {
          console.log(' Background service stopped unexpectedly, restarting...');
          await startBackgroundService();
        }
      } catch (error) {
        console.error(' Error checking background service status:', error);
      }
    }, 30000);

    // Authentication state listener
    const authSubscription = auth().onAuthStateChanged((user) => {
      console.log('👤 Auth state changed in SMS parser:', user?.uid || 'No user');
      setCurrentUser(user);
    });

    // Clean up when component unmounts
    return () => {
      console.log(' SmsParser component unmounting, cleaning up...');
      
      if (eventSubscription) {
        eventSubscription.remove();
        console.log(' SMS event listener removed');
      }
      
      appStateSubscription.remove();
      authSubscription();
      clearInterval(backgroundServiceCheck);
      
      stopBackgroundService();
      
      // Clear processing locks
      isProcessingSms = false;
      processingMessages.clear();
      
      console.log('SmsParser cleanup completed');
    };
  }, [onSmsReceived, onAmountExtracted]);

  return null;
};

export default SmsParser;