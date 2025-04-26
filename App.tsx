import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { StatusBar } from 'react-native';
import auth from '@react-native-firebase/auth';

import Homepage from './homepage/homepage';
import AnalyticsScreen from './analytics/analytics';
import SettingsScreen from './settings/settings';
import MonthTab from './calender/calender';
import LoginScreen from './settings/components/loginscreen';
import { RootStackParamList } from './types';
import { initializeFirebase } from './database/firebaseinit';


// Initialize Firebase (kept in case it's needed for other Firebase services)
initializeFirebase();
enableScreens();

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes using React Native Firebase
    const subscriber = auth().onAuthStateChanged(user => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    // Unsubscribe on unmount
    return subscriber;
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return ;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Homepage"
          screenOptions={{ 
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: '#ffffff' },
          }}
        >
          <Stack.Screen name="Homepage" component={Homepage} />
          <Stack.Screen name="Analytics" component={AnalyticsScreen} />
          <Stack.Screen name="MonthTab" component={MonthTab} />
          
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
                <SettingsScreen {...props} onLogout={handleLogout} />
              ) : (
                <LoginScreen {...props} onLogin={handleLogin} />
              )
            }
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}