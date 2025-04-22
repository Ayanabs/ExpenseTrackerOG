import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';

import Homepage from './homepage/homepage';
import AnalyticsScreen from './analytics/analytics';
import SettingsScreen from './settings/settings';
import MonthTab from './calender/calender';
import { RootStackParamList } from './types';

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
          <Stack.Screen name="MonthTab" component={MonthTab} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
