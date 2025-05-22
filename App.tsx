import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, ActivityIndicator, View } from 'react-native';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firestore } from './database/firebaseinit';

import Homepage from './homepage/homepage';
import AnalyticsScreen from './analytics/analytics';
import SettingsScreen from './settings/settings';
import MonthTab from './calender/calender';
import LoginScreen from './settings/components/loginscreen';
import AlertScreen from './alerts/alertscreen';

import { RootStackParamList } from './types';
import { initializeFirebase } from './database/firebaseinit';
import { requestUserPermission, setupNotificationListeners } from './alerts/notificationservice';
import { initializeSpendingAlertService, checkAndNotify } from './alerts/spendingalertservice';

// Initialize Firebase
initializeFirebase();

const Stack = createNativeStackNavigator<RootStackParamList>();

// Create a context to manage global app state
export const AppContext = React.createContext<{
  refreshData: () => void;
  isRefreshing: boolean;
}>({
  refreshData: () => {},
  isRefreshing: false,
});

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Homepage');

  useEffect(() => {
    // Setup notification system
    const setupNotifications = async () => {
      try {
        // Request notification permissions
        const hasPermission = await requestUserPermission();
        
        if (hasPermission) {
          
          // Set up notification listeners
          const unsubscribe = setupNotificationListeners((remoteMessage) => {
            // Store navigation target if we need to navigate to alerts
            if (remoteMessage?.data?.type === 'SPENDING_ALERT') {
              AsyncStorage.setItem('openScreen', 'Alerts');
            }
            
            console.log('Message received:', remoteMessage);
          });
          
          // Check if app was opened by a notification and get desired screen
          const openScreen = await AsyncStorage.getItem('openScreen');
          if (openScreen) {
            setInitialRoute(openScreen as keyof RootStackParamList);
            // Clear the stored route
            await AsyncStorage.removeItem('openScreen');
          }
          
          return unsubscribe;
        }
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };
    
    // Auth state subscriber
    const authSubscriber = auth().onAuthStateChanged(async user => {
      setIsAuthenticated(!!user);
      
      if (user) {
        // Save or update FCM token when user is authenticated
        try {
          const token = await messaging().getToken();
          if (token) {
            // Use set with merge option to ensure document exists
            await firestore().collection('users').doc(user.uid).set({
              fcmToken: token,
              tokenUpdatedAt: new Date().toISOString()
            }, { merge: true });
          }
          
          // Run an initial check to see if we need to notify user about spending
          await checkAndNotify();
        } catch (error) {
          console.error('Error updating FCM token:', error);
        }
      }
      
      setIsLoading(false);
      
      // Force refresh when auth state changes
      refreshData();
    });

    // Setup notifications
    const notificationCleanup = setupNotifications();
    
    // Cleanup on unmount
    return () => {
      authSubscriber();
      notificationCleanup?.then(unsubscribe => unsubscribe && unsubscribe());
    };
  }, []);

  // Initialize spending alert service when user is authenticated
  useEffect(() => {
    let unsubscribeAlertService: (() => void) | null = null;
    
    if (isAuthenticated) {
      // Initialize spending alert service
      unsubscribeAlertService = initializeSpendingAlertService();
    }
    
    return () => {
      if (unsubscribeAlertService) {
        unsubscribeAlertService();
      }
    };
  }, [isAuthenticated]);

  const refreshData = () => {
    setIsRefreshing(true);
    // Increment refresh key to force component remounts
    setRefreshKey(prevKey => prevKey + 1);
    
    // Allow a short delay for state updates to propagate
    setTimeout(() => {
      setIsRefreshing(false);
    }, 300);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    refreshData();
  };

  const handleLogout = async (navigation: any) => {
    try {
      setIsRefreshing(true);
      
      // Sign out from Firebase
      await auth().signOut();
      
      // Clear AsyncStorage
      await AsyncStorage.clear();

      // Update authentication state
      setIsAuthenticated(false);
      
      // Reset the navigation stack and navigate to Login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Homepage' }], // Navigate to Homepage instead of Login
      });
      
      setIsRefreshing(false);
      
      // Force refresh data after logout
      refreshData();
    } catch (error) {
      console.error('Error signing out:', error);
      setIsRefreshing(false);
    }
  };

  // Show loading screen while checking authentication
 

  return (
    <AppContext.Provider value={{ refreshData, isRefreshing }}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{ 
              headerShown: false,
              animation: 'slide_from_right',
              contentStyle: { backgroundColor: '#ffffff' },
            }}
          >
            <Stack.Screen 
              name="Homepage" 
              component={Homepage} 
              // Using key to force component remount on refresh
              key={`homepage-${refreshKey}`}
            />
            <Stack.Screen 
              name="Analytics" 
              component={AnalyticsScreen}
              key={`analytics-${refreshKey}`} 
            />
            <Stack.Screen 
              name="MonthTab" 
              component={MonthTab}
              key={`monthtab-${refreshKey}`}
            />
            
            {/* Authentication screen */}
            <Stack.Screen
              name="Login"
              options={{ headerShown: false }}
              children={(props) => <LoginScreen {...props} onLogin={handleLogin} />}
            />
            
            {/* Protected route for Settings */}
            <Stack.Screen
              name="Settings"
              options={{ headerShown: false }}
              children={(props) =>
                isAuthenticated ? (
                  <SettingsScreen 
                    {...props} 
                    onLogout={() => handleLogout(props.navigation)} 
                    key={`settings-${refreshKey}`}
                  />
                ) : (
                  <LoginScreen {...props} onLogin={handleLogin} />
                )
              }
            />
            
            {/* Alerts Screen */}
            <Stack.Screen
              name="Alerts"
              options={{ headerShown: false }}
              children={(props) =>
                isAuthenticated ? (
                  <AlertScreen 
                    {...props}
                    key={`alerts-${refreshKey}`}
                  />
                ) : (
                  <LoginScreen {...props} onLogin={handleLogin} />
                )
              }
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </AppContext.Provider>
  );
}