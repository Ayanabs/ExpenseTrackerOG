import React from 'react'; 
import { View, ScrollView, StyleSheet } from 'react-native'; 
import SettingsHeader from './components/settingsheader';
import ProfileAvatar from './components/profileavatar'; 
import ProfileFields from './components/profilefields'; 
import AlertsToggle from './components/alertstoggle'; 
import LogoutButton from './components/logoutbutton'; 
 

const SettingsScreen = () => { 
  return ( 
    <View style={styles.container}> 
      <SettingsHeader /> 
      <ScrollView style={styles.scroll}> 
        <View style={styles.card}> 
          <ProfileAvatar /> 
          <ProfileFields /> 
          <AlertsToggle /> 
          <LogoutButton /> 
        </View> 
      </ScrollView> 
    </View> 
  ); 
}; 
 

const styles = StyleSheet.create({ 
  container: { 
    flex: 1, 
    backgroundColor: '#EAE9E2', 
  }, 
  scroll: { 
    flex: 1, 
  }, 
  card: { 
    backgroundColor: '#1E1E1E', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    paddingTop: 20, 
    flex: 1, 
  }, 
}); 
 

export default SettingsScreen; 
 