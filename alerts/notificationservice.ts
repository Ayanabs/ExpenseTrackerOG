import { Platform, PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const requestUserPermission = async () => {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    return enabled;
  } else if (Platform.OS === 'android') {
    try {
      // For Android 13+ (API level 33+)
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true; // For Android < 13, permissions are granted at install time
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }
  return false;
};

export const getFCMToken = async () => {
  try {
    await messaging().registerDeviceForRemoteMessages();
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Failed to get FCM token:', error);
    return null;
  }
};

export const setupNotificationListeners = (
  onNotification: (notification: any) => void
) => {
  // Handle notifications when app is in foreground
  const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
    console.log('Foreground notification received:', remoteMessage);
    
    // For spending alerts, store them in AsyncStorage
    if (remoteMessage?.data?.type === 'SPENDING_ALERT') {
      const alerts = await AsyncStorage.getItem('spendingAlerts');
      const alertsArray = alerts ? JSON.parse(alerts) : [];
      
      const newAlert = {
        id: new Date().getTime().toString(),
        title: remoteMessage.notification?.title || 'Spending Alert',
        message: remoteMessage.notification?.body || '',
        date: new Date().toISOString(),
        read: false,
        type: remoteMessage.data?.alertType || 'warning'
      };
      
      alertsArray.unshift(newAlert);
      await AsyncStorage.setItem('spendingAlerts', JSON.stringify(alertsArray));
    }
    
    onNotification(remoteMessage);
  });

  // Handle notification when app is in background and opened via notification
  const unsubscribeBackground = messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Background notification opened:', remoteMessage);
    
    // Store navigation destination if needed
    if (remoteMessage?.data?.type === 'SPENDING_ALERT') {
      AsyncStorage.setItem('openScreen', 'Alerts');
    }
    
    onNotification(remoteMessage);
  });

  // Check if app was opened from a notification
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('App opened from quit state via notification:', remoteMessage);
        
        // Store navigation destination if needed
        if (remoteMessage?.data?.type === 'SPENDING_ALERT') {
          AsyncStorage.setItem('openScreen', 'Alerts');
        }
        
        onNotification(remoteMessage);
      }
    });

  return () => {
    unsubscribeForeground();
    unsubscribeBackground();
  };
};

export const sendLocalNotification = async (title: string, body: string, data: any = {}) => {
  try {
    // For Android, we can use the notification composer
    await messaging().sendMessage({
      data: {
        type: 'SPENDING_ALERT',
        title,
        body,
        timestamp: new Date().toISOString(),
        ...data
      },
      messageId: String(Date.now()),
      messageType: 'data',
      ttl: 3600,
      collapseKey: 'spending_alert',
      fcmOptions: {}
    });
    
    // Store the notification in AsyncStorage for the in-app alert system
    const alerts = await AsyncStorage.getItem('spendingAlerts');
    const alertsArray = alerts ? JSON.parse(alerts) : [];
    
    const newAlert = {
      id: new Date().getTime().toString(),
      title,
      message: body,
      date: new Date().toISOString(),
      read: false,
      type: data.alertType || 'warning'
    };
    
    alertsArray.unshift(newAlert);
    await AsyncStorage.setItem('spendingAlerts', JSON.stringify(alertsArray));
    
    return true;
  } catch (error) {
    console.error('Error sending local notification:', error);
    return false;
  }
};