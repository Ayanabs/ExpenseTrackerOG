import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import SettingsHeader from './components/settingsheader';
import ProfileAvatar from './components/profileavatar';
import ProfileFields from './components/profilefields';
import AlertsToggle from './components/alertstoggle';
import LogoutButton from './components/logoutbutton';
import { COLORS } from '../theme';

const SettingsScreen = ({ onLogout }: { onLogout: () => void }) => {
  return (
    <View style={styles.container}>
      <SettingsHeader />
      <ScrollView style={styles.scroll}>
        <View style={styles.card}>
          <ProfileAvatar />
          <ProfileFields />
          <AlertsToggle />
          <LogoutButton onLogout={onLogout} />  {/* Trigger logout */}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d9d1e8',
    
  },
  scroll: {
    flex: 1,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: '21%',
    paddingTop: 20,
    flex: 1,
  
  },
});

export default SettingsScreen;
