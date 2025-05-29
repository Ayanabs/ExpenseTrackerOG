import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { loginUser, loginWithGoogle, registerUser, configureGoogleSignIn } from '../../database/firebaseAuth';
import { AppContext } from '../../App'; // Import the context
import LoginModal from './loginmodal';
import RegisterModal from './registermodal';
import SettingsHeader from './settingsheader';
import { ImageBackground } from 'react-native';

const backgroundImage = require('../../assets/images/background1.png');

const LoginScreen = ({ navigation, onLogin }: { navigation: any, onLogin: () => void }) => {
  const { refreshData } = useContext(AppContext);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Configure Google Sign-In when component mounts
  useEffect(() => {
    configureGoogleSignIn();
  }, []);

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

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      
    
      refreshData();
      
      // Brief timeout to ensure data is loaded
      setTimeout(() => {
        setIsLoading(false);
        setLoginModalVisible(false);
        
       
        navigation.reset({
          index: 0,
          routes: [{ name: 'Homepage' }],
        });
        
        
        onLogin();
      }, 500);
      
      return Promise.resolve();
    } catch (error) {
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to login with Google';
      Alert.alert('Google Login Error', errorMessage);
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
      const user = await registerUser(email, password, name, phone);
      
      setIsLoading(false);
     
      Alert.alert('Success', 'Registration successful! You can now login.');
      
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
      <ImageBackground source={require('../../assets/images/background1.png')} style={styles.container2} imageStyle={styles.imageStyle}>
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
      </ImageBackground>

      {/* Pass the Google login handler to the LoginModal */}
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
    borderRadius: 25,
  },
  container2: {
   
    marginTop: '75%',
    height: '100%', 
    backgroundColor: '#EAE9E2',
    borderRadius: 25,
    width: '100%',
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
  imageStyle: {
  borderRadius: 25,
  resizeMode: 'cover',
},

});

export default LoginScreen;