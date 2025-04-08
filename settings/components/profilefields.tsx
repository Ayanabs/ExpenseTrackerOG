import React from 'react'; 
import { View, TextInput, StyleSheet } from 'react-native'; 
 

const ProfileFields = () => { 
  return ( 
    <View> 
      {['Name', 'Email', 'Contact'].map((label, i) => ( 
        <TextInput 
          key={i} 
          placeholder={label} 
          placeholderTextColor="#AAA" 
          style={styles.input} 
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
