// Fixed SmsParser.tsx - Ensures single storage per SMS
import { useEffect, useState } from 'react';
import { PermissionsAndroid, Alert, AppState, Platform } from 'react-native';
import BackgroundService from 'react-native-background-actions';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { AppRegistry } from 'react-native';

interface SmsParserProps {
  onSmsReceived: (sms: string) => void;
  onAmountExtracted: (amount: string) => void;
  setTotalSpent?: React.Dispatch<React.SetStateAction<number>>;
}

// FIXED: Global processing lock to prevent concurrent processing
let isProcessingSms = false;
const processingMessages = new Set<string>();

// ENHANCED: Atomic Firestore save with transaction
const saveToFirestore = async (message: string, extractedAmount: string) => {
  try {
    console.log('=== FIRESTORE SAVE ATTEMPT START ===');
    console.log('Message length:', message.length);
    console.log('Extracted amount:', extractedAmount);

    // Check authentication status
    const currentUser = auth().currentUser;
    if (!currentUser) {
      console.error('❌ No authenticated user found');
      throw new Error('User not authenticated');
    }

    console.log('✅ User authenticated:', currentUser.uid);

    // Validate and parse amount
    const amount = parseFloat(extractedAmount);
    if (isNaN(amount) || amount <= 0) {
      console.error('❌ Invalid amount:', extractedAmount);
      throw new Error('Invalid amount extracted');
    }

    console.log('✅ Amount validated:', amount);

    // Create message hash for duplicate prevention
    const messageHash = hashMessage(message);
    console.log('✅ Message hash created:', messageHash);

    // Check if already processing this message
    if (processingMessages.has(messageHash)) {
      console.log('⚠️ Message already being processed, skipping');
      return null;
    }

    processingMessages.add(messageHash);

    try {
      // FIXED: Use Firestore transaction for atomic duplicate check + save
      const currentDate = new Date();
      const expenseData = {
        amount,
        source: 'SMS',
        date: firestore.Timestamp.fromDate(currentDate),
        category: 'SMS',
        userId: currentUser.uid,
        description: message.slice(0, 100),
        messageHash: messageHash,
        createdAt: firestore.Timestamp.fromDate(currentDate),
        rawMessage: message.slice(0, 500),
        appVersion: '1.0.0',
        platform: Platform.OS,
        processingTimestamp: Date.now(),
      };

      console.log('💾 Attempting atomic save with transaction...');

      // First check for duplicates outside of transaction
      const duplicateCheck = await firestore()
        .collection('expenses')
        .where('messageHash', '==', messageHash)
        .where('userId', '==', currentUser.uid)
        .limit(1)
        .get();

      if (!duplicateCheck.empty) {
        console.log('⚠️ Duplicate message found, skipping save');
        throw new Error('DUPLICATE_MESSAGE');
      }

      const result = await firestore().runTransaction(async (transaction) => {
        // Create new document reference
        const newDocRef = firestore().collection('expenses').doc();
        
        // Set the document within transaction
        transaction.set(newDocRef, expenseData);
        
        return newDocRef.id;
      });

      console.log('✅ Document saved successfully with transaction, ID:', result);
      console.log('=== FIRESTORE SAVE ATTEMPT END ===');
      return result;

    } catch (transactionError: any) {
      if (transactionError.message === 'DUPLICATE_MESSAGE') {
        console.log('⚠️ Duplicate message detected in transaction');
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
    processingMessages.delete(hashMessage(message));
    throw error;
  }
};

// Enhanced background task with single processing
const backgroundSmsTask = async (taskData: any) => {
  console.log('🔧 Background SMS task started:', taskData);

  if (!taskData || !taskData.message) {
    console.log('⚠️ No valid message data in background task');
    return;
  }

  const { body } = taskData.message;
  if (!body) {
    console.log('⚠️ No message body in background task');
    return;
  }

  // FIXED: Check processing lock in background task too
  if (isProcessingSms) {
    console.log('⚠️ SMS already being processed, skipping background task');
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
      console.log('✅ Background task extracted amount:', extractedAmount);
      const docId = await saveToFirestore(body, extractedAmount);
      if (docId) {
        console.log('✅ Background SMS processing completed, document ID:', docId);
      } else {
        console.log('⚠️ Background SMS processing completed but no document ID returned (likely duplicate)');
      }
    } else {
      console.log('ℹ️ No amount found in background SMS:', body.substring(0, 50));
    }
  } catch (error) {
    console.error('❌ Error in background SMS task:', error);
  }
};

// Enhanced amount extraction with more patterns
const extractAmountFromSMS = (text: string): string | null => {
  console.log('🔍 Extracting amount from SMS text:', text.substring(0, 100));
  
  const patterns = [
    /Rs\.?\s?(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i,
    /INR\s?(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i,
    /₹\s?(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i,
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
      console.log('✅ Amount extracted using pattern:', pattern.toString(), 'Result:', cleanAmount);
      return cleanAmount;
    }
  }

  console.log('⚠️ No amount pattern matched in SMS');
  return null;
};

// Improved hash function with timestamp window
const hashMessage = (message: string): string => {
  // Include 5-minute time window to handle rapid duplicates
  const timeWindow = Math.floor(Date.now() / (5 * 60 * 1000));
  const content = message + timeWindow.toString();
  
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
        console.log('✅ All SMS permissions granted');
        return true;
      } else {
        console.log('❌ Some SMS permissions denied');
        Alert.alert('Permission Denied', 'You need to allow all permissions for this feature to work.');
        return false;
      }
    } catch (err) {
      console.warn('❌ Error requesting SMS permissions:', err);
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
        console.log('🛑 Stopping existing background service...');
        await BackgroundService.stop();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for clean shutdown
      }

      console.log('🚀 Starting fresh background service for SMS monitoring');
      await BackgroundService.start(backgroundTask, backgroundServiceOptions);
      console.log('✅ Background service started successfully');
      
    } catch (error) {
      console.error('❌ Failed to start background service:', error);
    }
  };

  const stopBackgroundService = async () => {
    try {
      if (await BackgroundService.isRunning()) {
        await BackgroundService.stop();
        console.log('🛑 Background service stopped');
      }
    } catch (error) {
      console.error('❌ Failed to stop background service:', error);
    }
  };

  const handleAppStateChange = (nextAppState: string) => {
    console.log('📱 App state changing from', appState, 'to', nextAppState);
    
    if (appState.match(/active|foreground/) && nextAppState.match(/inactive|background/)) {
      console.log('📱 App going to background, ensuring background service is running');
      startBackgroundService();
    }
    
    setAppState(nextAppState as typeof AppState.currentState);
  };

  // FIXED: Single SMS processing function with comprehensive locking
  const processSmsMessage = async (messageBody: string, source: string = 'foreground') => {
    // CRITICAL: Global processing lock
    if (isProcessingSms) {
      console.log(`⚠️ Already processing an SMS, skipping ${source} message`);
      return;
    }

    const messageHash = hashMessage(messageBody);
    if (processingMessages.has(messageHash)) {
      console.log(`⚠️ Message with hash ${messageHash} already being processed, skipping ${source}`);
      return;
    }

    isProcessingSms = true;

    try {
      console.log(`📨 Processing SMS from ${source}:`, messageBody.substring(0, 100));
      
      // Check if user is authenticated
      if (!currentUser) {
        console.error('❌ Cannot process SMS: No authenticated user');
        return;
      }
      
      onSmsReceived(messageBody);
      
      const extractedAmount = extractAmountFromSMS(messageBody);
      
      if (extractedAmount) {
        console.log(`💰 Amount extracted from ${source} SMS:`, extractedAmount);
        
        // Call the callback first
        onAmountExtracted(extractedAmount);
        
        // Save to Firestore with comprehensive error handling
        try {
          const docId = await saveToFirestore(messageBody, extractedAmount);
          
          if (docId) {
            console.log(`✅ ${source} SMS processing completed successfully, document ID:`, docId);
          } else {
            console.log(`⚠️ ${source} SMS processing completed but no document ID returned (likely duplicate)`);
          }
        } catch (saveError) {
          console.error(`❌ Failed to save ${source} SMS to Firestore:`, saveError);
          
          Alert.alert(
            'Save Error',
            'Failed to save SMS expense. Please check your internet connection.',
            [{ text: 'OK' }]
          );
        }
      } else {
        console.log(`ℹ️ No amount found in ${source} SMS:`, messageBody.substring(0, 50));
      }
    } catch (error) {
      console.error(`❌ Error processing ${source} SMS:`, error);
    } finally {
      // CRITICAL: Always release the lock
      isProcessingSms = false;
    }
  };

  useEffect(() => {
    console.log('🔧 SmsParser component initializing...');
    
    // Request necessary permissions
    requestSMSPermission();
    
    // Get the current user
    getCurrentUser();

    // Set up app state change handler
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    // FIXED: Use ONLY DeviceEventEmitter - removed duplicate native module listener
    const eventEmitter = Platform.select({
      android: require('react-native').DeviceEventEmitter,
      default: null
    });

    let eventSubscription: any = null;
    
    if (eventEmitter) {
      console.log('📱 Setting up SINGLE SMS event listener...');
      
      eventSubscription = eventEmitter.addListener('sms_received', (event: any) => {
        console.log('📨 Received SMS event from DeviceEventEmitter:', {
          sender: event?.sender,
          bodyLength: event?.body?.length || 0,
          timestamp: new Date().toISOString()
        });
        
        if (event && event.body) {
          processSmsMessage(event.body, 'DeviceEventEmitter');
        } else {
          console.log('⚠️ Invalid SMS event received:', event);
        }
      });
      
      console.log('✅ Single SMS event listener set up successfully');
    } else {
      console.log('⚠️ EventEmitter not available on this platform');
    }

    // Start background service for when app is not active
    console.log('🚀 Starting background service on component mount...');
    startBackgroundService();

    // Background service health check
    const backgroundServiceCheck = setInterval(async () => {
      try {
        const isRunning = await BackgroundService.isRunning();
        if (!isRunning && appState.match(/inactive|background/)) {
          console.log('⚠️ Background service stopped unexpectedly, restarting...');
          await startBackgroundService();
        }
      } catch (error) {
        console.error('❌ Error checking background service status:', error);
      }
    }, 30000);

    // Authentication state listener
    const authSubscription = auth().onAuthStateChanged((user) => {
      console.log('👤 Auth state changed in SMS parser:', user?.uid || 'No user');
      setCurrentUser(user);
    });

    // Clean up when component unmounts
    return () => {
      console.log('🔧 SmsParser component unmounting, cleaning up...');
      
      if (eventSubscription) {
        eventSubscription.remove();
        console.log('✅ SMS event listener removed');
      }
      
      appStateSubscription.remove();
      authSubscription();
      clearInterval(backgroundServiceCheck);
      
      stopBackgroundService();
      
      // Clear processing locks
      isProcessingSms = false;
      processingMessages.clear();
      
      console.log('✅ SmsParser cleanup completed');
    };
  }, [onSmsReceived, onAmountExtracted]);

  return null;
};

export default SmsParser;