import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, ActivityIndicator, View } from 'react-native';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Homepage from './homepage/homepage';
import AnalyticsScreen from './analytics/analytics';
import SettingsScreen from './settings/settings';
import MonthTab from './calender/calender';
import LoginScreen from './settings/components/loginscreen';
import { RootStackParamList } from './types';
import { initializeFirebase } from './database/firebaseinit';

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

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(user => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
      
      // Force refresh when auth state changes
      refreshData();
    });

    return subscriber; // Cleanup on unmount
  }, []);

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
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#CFAEFF' }}>
        <ActivityIndicator size="large" color="#47248c" />
      </View>
    );
  }

  return (
    <AppContext.Provider value={{ refreshData, isRefreshing }}>
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
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </AppContext.Provider>
  );
}