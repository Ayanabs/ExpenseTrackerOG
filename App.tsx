import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import Homepage from './homepage/homepage';
import AnalyticsScreen from './analytics/analytics'; // Adjust the path as needed
import { enableScreens } from 'react-native-screens';
import SettingsScreen from './settings/settings'; // Adjust the path as needed
import { SafeAreaProvider } from 'react-native-safe-area-context';

enableScreens();
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Homepage"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Homepage" component={Homepage} />
        <Stack.Screen name="Analytics" component={AnalyticsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaProvider>
  );
}
