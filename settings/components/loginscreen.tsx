import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { loginUser, registerUser } from '../../database/firebaseAuth';
import { firestore } from '../../database/firebaseinit';
import { AppContext } from '../../App'; // Import the context
import LoginModal from './loginmodal';
import RegisterModal from './registermodal';
import SettingsHeader from './settingsheader';

// Improved migration function
const migrateTemporaryData = async (userId: string) => {
  try {
    // Get temporary spending limit
    const tempLimitDoc = await firestore().collection('spendingLimits').doc('temporaryUser').get();
    
    // If temporary data exists, migrate it to the user account
    if (tempLimitDoc.exists) {
      const tempLimitData = tempLimitDoc.data();
      if (tempLimitData) {
        await firestore().collection('spendingLimits').doc(userId).set({
          ...tempLimitData,
          userId: userId
        });
      }
    }
    
    // Get temporary expenses
    const tempExpenses = await firestore()
      .collection('expenses')
      .where('userId', '==', 'temporaryUser')
      .get();

    // Migrate each expense to the user account if there are any
    if (!tempExpenses.empty) {
      const batch = firestore().batch();
      tempExpenses.docs.forEach(doc => {
        const newRef = firestore().collection('expenses').doc();
        batch.set(newRef, {
          ...doc.data(),
          userId: userId
        });
      });
      
      await batch.commit();
    }

    console.log('Temporary data migrated successfully to user account');
  } catch (error) {
    console.error('Error migrating temporary data:', error);
  }
};

const LoginScreen = ({ navigation, onLogin }: { navigation: any, onLogin: () => void }) => {
  const { refreshData } = useContext(AppContext);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Add log to debug modal visibility
  console.log('Modal States:', { loginModalVisible, registerModalVisible });

  const handleLogin = async (email: string, password: string) => {
    if (!email || !password) {
      Alert.alert('Error', 'Email and password are required');
      return Promise.reject(new Error('Email and password are required'));
    }

    setIsLoading(true);
    try {
      const user = await loginUser(email, password);
      
      if (user) {
        // Migrate any temporary data to the user account
        await migrateTemporaryData(user.uid);
        
        // Call refreshData to update app state
        refreshData();
        
        // Brief timeout to ensure data is loaded
        setTimeout(() => {
          setIsLoading(false);
          setLoginModalVisible(false);
          
          // Navigate to Homepage
          navigation.reset({
            index: 0,
            routes: [{ name: 'Homepage' }],
          });
          
          // Then call onLogin to update app state
          onLogin();
        }, 500);
      }
      
      return Promise.resolve();
    } catch (error) {
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to login';
      Alert.alert('Login Error', errorMessage);
      return Promise.reject(error);
    }
  };

  // Rest of the component remains the same
  const handleRegister = async (email: string, password: string, name: string, phone?: string) => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Name, email and password are required');
      return Promise.reject(new Error('Name, email and password are required'));
    }

    setIsLoading(true);
    try {
      const user = await registerUser(email, password, name, phone);
      
      if (user) {
        // Migrate any temporary data to the user account
        await migrateTemporaryData(user.uid);
      }
      
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

  const handleLoginPress = () => {
    console.log('Login button pressed');
    setLoginModalVisible(true);
  };

  const handleRegisterPress = () => {
    console.log('Register button pressed');
    setRegisterModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container2}>
        <SettingsHeader />
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLoginPress}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Login</Text> 
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.registerButton} 
            onPress={handleRegisterPress}
            disabled={isLoading}
          >
            <Text style={styles.registerbuttonText}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Render modals regardless of visibility state - to ensure they're in the component tree */}
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