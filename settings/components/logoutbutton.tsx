import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';

// Updated to handle Firebase logout
const LogoutButton = ({ onLogout }: { onLogout: () => void }) => {
  const handleLogout = async () => {
    try {
      // Sign out from Firebase Authentication
      await auth().signOut();
      
      // After successful signout, call the onLogout prop callback
      onLogout();
      
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Logout Failed', 'There was a problem signing out. Please try again.');
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleLogout}>
      <Text style={styles.text}>Logout</Text>
      <Icon name="logout" size={24} color="#FFF" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginRight: 24,
    marginBottom: 20,
    gap: 6,
  },
  text: {
    color: '#FFF',
    fontSize: 14,
  },
});

export default LogoutButton;