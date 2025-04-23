import React, { useState } from 'react'; 
import { View, TextInput, StyleSheet } from 'react-native'; 
 

const ProfileFields = () => { 
  const [email, setEmail] = useState('');

  return ( 
    <View> 
      {['Name', 'Email', 'Contact'].map((label, i) => ( 
        <TextInput 
          key={i} 
          placeholder={label} 
          placeholderTextColor="#AAA" 
          style={styles.input} 
          value={label === "Email" ? email : ''}  // Bind email here
          onChangeText={text => { if (label === "Email") setEmail(text) }} // Update email state
        /> 
      ))} 
    </View> 
  ); 
}; 
 

const styles = StyleSheet.create({ 
  input: { 
    backgroundColor: '#3A3A3A', 
    color: '#FFF', 
    padding: 12, 
    marginVertical: 8, 
    marginHorizontal: 20, 
    borderRadius: 12, 
  }, 
}); 
 

export default ProfileFields; 
