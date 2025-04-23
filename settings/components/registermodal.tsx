
// RegisterModal.tsx
import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';

interface RegisterModalProps {
  visible: boolean;
  onClose: () => void;
  onRegister: (email: string, password: string, name: string, phone?: string) => Promise<void>;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ visible, onClose, onRegister }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    if (!name) {
      setError('Name is required');
      return false;
    }
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Pass the form data to the onRegister callback from LoginScreen
      await onRegister(email, password, name, phone);
      setIsLoading(false);
      // Clear form
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      onClose();
    } catch (error) {
      setIsLoading(false);
      if (error instanceof Error) {
        setError(error.message || 'Registration failed. Please try again.');
      } else {
        setError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Register</Text>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Phone (optional)"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          
          {isLoading ? (
            <ActivityIndicator size="small" color="#47248c" />
          ) : (
            <View style={styles.buttonContainer}>
              <Button 
                title="Register" 
                onPress={handleSubmit}
                color="#47248c"
              />
              <Button 
                title="Cancel" 
                onPress={onClose}
                color="#666"
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 8,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  }
});

export default RegisterModal;