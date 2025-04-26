import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppContext } from '../../App'; // Import the context

// Updated to handle Firebase logout with proper state management
const LogoutButton = ({ onLogout }: { onLogout: () => void }) => {
  const { refreshData } = useContext(AppContext);

  const handleLogout = async () => {
    try {
      // Call the refreshData function from context first
      refreshData();
      
      // Then execute the provided onLogout function
      onLogout();
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