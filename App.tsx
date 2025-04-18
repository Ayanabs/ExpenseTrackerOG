import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { RealmProvider } from '@realm/react';

import Homepage from './homepage/homepage';
import AnalyticsScreen from './analytics/analytics';
import SettingsScreen from './settings/settings';
import MonthTab from './calender/calender';
import { RootStackParamList } from './types';
import { SpendingLimitPeriodSchema } from './homepage/realmHelpers';
import { Expense } from './database/expenses'; // Make sure you export ExpenseSchema properly

enableScreens();
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <RealmProvider
      schema={[SpendingLimitPeriodSchema, Expense]} // Include your schemas
      schemaVersion={4} // Ensure this version matches your schema updates
      onMigration={(oldRealm, newRealm) => {
        const oldVersion = oldRealm.schemaVersion;
        console.log(`Migrating from schema version ${oldVersion} to 4`); // Updated to 4
        
        // Migration logic if schema version is older
        if (oldVersion < 2) {
          // Handle migration logic for version 1 to version 2 changes
        }
        if (oldVersion < 3) {
          // Handle migration logic for version 2 to version 3 changes
        }
        if (oldVersion < 4) {
          // Migration for version 3 to 4 changes, if any
        }
      }}
      deleteRealmIfMigrationNeeded={false}  // Keep it false for production, avoid losing data
    >
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
    </RealmProvider>
  );
}
