import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';

import Homepage from './homepage/homepage';
import AnalyticsScreen from './analytics/analytics';
import SettingsScreen from './settings/settings';
import MonthTab from './calender/calender';
import LoginScreen from './settings/components/loginscreen'; // Import LoginScreen

import { RootStackParamList } from './types';

enableScreens();
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);  // Track login status

  const handleLogin = () => {
    setIsAuthenticated(true);  // Set authenticated to true once login happens
  };

  const handleLogout = () => {
    setIsAuthenticated(false);  // Set authenticated to false on logout
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Homepage"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Homepage" component={Homepage} />
          <Stack.Screen name="Analytics" component={AnalyticsScreen} />
          <Stack.Screen name="MonthTab" component={MonthTab} />
          
          {/* Login or Register before accessing Settings */}
          <Stack.Screen
            name="Login"
            options={{ headerShown: false }}
            children={(props) => <LoginScreen {...props} onLogin={handleLogin} />}  // Pass handleLogin function
          />

          <Stack.Screen
            name="Settings"
            options={{ headerShown: false }}
            children={(props) =>
              isAuthenticated ? (
                <SettingsScreen {...props} onLogout={handleLogout} /> // Redirect to Settings if authenticated
              ) : (
                <LoginScreen {...props} onLogin={handleLogin} /> // Show LoginScreen if not authenticated
              )
            }
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
