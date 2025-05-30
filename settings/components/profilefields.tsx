import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';  // Import from React Native Firebase
import firestore from '@react-native-firebase/firestore';  // Import from React Native Firebase

const ProfileFields = () => {
  // State for user fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Function to fetch user data from Firestore
  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const currentUser = auth().currentUser;

      if (currentUser) {
        const userDocRef = firestore().doc(`users/${currentUser.uid}`);
        const userSnapshot = await userDocRef.get();

        if (userSnapshot.exists) {
          const userData = userSnapshot.data();
          setName(userData?.name || '');
          setEmail(userData?.email || '');
          setContact(userData?.phone || ''); 
        } else {
          Alert.alert('Error', 'User data not found');
        }
      } else {
        Alert.alert('Error', 'No user is signed in');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to save user data to Firestore
  const saveUserData = async () => {
    setIsSaving(true);
    try {
      const currentUser = auth().currentUser;

      if (!currentUser) {
        Alert.alert('Error', 'No user is signed in');
        return;
      }

      // Validate inputs
      if (!name.trim()) {
        Alert.alert('Error', 'Name cannot be empty');
        return;
      }

      if (!email.trim()) {
        Alert.alert('Error', 'Email cannot be empty');
        return;
      }

      
      const userDocRef = firestore().doc(`users/${currentUser.uid}`);
      await userDocRef.update({
        name: name.trim(),
        email: email.trim(),
        phone: contact.trim() 
      });

     
      if (email !== currentUser.email) {
        await currentUser.updateEmail(email);  
        Alert.alert('Note', 'Email updated in Firebase Authentication');
      }

      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user data:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8A4FFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.fieldsContainer}>
        <TextInput
          placeholder="Name"
          placeholderTextColor="#AAA"
          style={[styles.input, !isEditing && styles.disabledInput]}
          value={name}
          onChangeText={setName}
          editable={isEditing}
        />
        <TextInput
          placeholder="Email"
          placeholderTextColor="#AAA"
          style={[styles.input, !isEditing && styles.disabledInput]}
          value={email}
          onChangeText={setEmail}
          editable={isEditing}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Contact"
          placeholderTextColor="#AAA"
          style={[styles.input, !isEditing && styles.disabledInput]}
          value={contact}
          onChangeText={setContact}
          editable={isEditing}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.buttonContainer}>
        {isEditing ? (
          <>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]} 
              onPress={saveUserData}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Save</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={() => {
                fetchUserData(); 
                setIsEditing(false);
              }}
              disabled={isSaving}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity 
            style={[styles.button, styles.editButton]} 
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  fieldsContainer: {
    marginBottom: 20,
  },
  loadingContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#3A3A3A',
    color: '#FFF',
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 20,
    borderRadius: 12,
    
  },
  disabledInput: {
    opacity: 0.7,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 20,
  },
  button: {
    padding: 12,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: '#47248c',
  },
  saveButton: {
    backgroundColor: '#47248c',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  }
});

export default ProfileFields;
