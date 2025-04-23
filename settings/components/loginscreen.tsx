import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { loginUser, registerUser } from '../../database/firebaseAuth'; // Import authentication logic
import LoginModal from './loginmodal';
import RegisterModal from './registermodal';
import SettingsHeader from './settingsheader';

const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    if (!email || !password) {
      Alert.alert('Error', 'Email and password are required');
      return Promise.reject(new Error('Email and password are required'));
    }

    setIsLoading(true);
    try {
      await loginUser(email, password);  // Use the login function from firebaseAuth
      setIsLoading(false);
      onLogin();  // After login, call onLogin callback to update app state
      return Promise.resolve();
    } catch (error) {
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to login';
      Alert.alert('Login Error', errorMessage);
      return Promise.reject(error);
    }
  };

  const handleRegister = async (email: string, password: string, name: string, phone?: string) => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Name, email and password are required');
      return Promise.reject(new Error('Name, email and password are required'));
    }

    setIsLoading(true);
    try {
      await registerUser(email, password, name, phone);  // Use the register function from firebaseAuth
      setIsLoading(false);
      // Show success message
      Alert.alert('Success', 'Registration successful! You can now login.');
      // After successful registration, show the login modal
      setRegisterModalVisible(false);
      setLoginModalVisible(true);
      return Promise.resolve();
    } catch (error) {
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to register';
      Alert.alert('Registration Error', errorMessage);
      return Promise.reject(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container2}>
        <SettingsHeader />
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={() => setLoginModalVisible(true)}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Login</Text> 
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.registerButton} 
            onPress={() => setRegisterModalVisible(true)}
            disabled={isLoading}
          >
            <Text style={styles.registerbuttonText}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal Components - passing the handler functions properly */}
      <LoginModal 
        visible={loginModalVisible} 
        onClose={() => setLoginModalVisible(false)} 
        onLogin={handleLogin} 
      />
      <RegisterModal 
        visible={registerModalVisible} 
        onClose={() => setRegisterModalVisible(false)} 
        onRegister={handleRegister} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#CFAEFF',
  },
  container2: {
    marginTop: '75%',
    height: '100%', 
    backgroundColor: '#EAE9E2',
    borderRadius: 25,
    width: '88%',
    alignItems: 'center',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  card: {
    backgroundColor: '#1E1E1E',
    width: '100%',
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginTop: '30%',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#FFF',
    textAlign: 'center',
  },
  loginButton: {
    padding: 10,
    backgroundColor: '#47248c',
    borderColor: '#8A4FFF',
    borderWidth: 1,
    borderRadius: 10,
    width: '100%',
    marginBottom: 10,
  },
  registerButton: {
    padding: 10,
    backgroundColor: '#ffff',
    borderColor: '#8A4FFF',
    borderWidth: 1,
    borderRadius: 10,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  registerbuttonText: {
    color: '#47248c',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default LoginScreen;