import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Updated to accept onLogout as a prop
const LogoutButton = ({ onLogout }: { onLogout: () => void }) => (
  <TouchableOpacity style={styles.button} onPress={onLogout}>
    <Text style={styles.text}>Logout</Text>
    <Icon name="logout" size={24} color="#FFF" />
  </TouchableOpacity>
);

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
