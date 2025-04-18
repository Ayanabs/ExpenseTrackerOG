import React from 'react'; 
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native'; 
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
 

const ProfileAvatar = () => { 
  return ( 
    <View style={styles.wrapper}> 
      <Image 
        source={require('../../assets/avatar.png')} // replace with your asset 
        style={styles.image} 
      /> 
      <TouchableOpacity style={styles.toggleThemeBtn}> 
        <Icon name="weather-night" size={20} color="#FFF" /> 
      </TouchableOpacity> 
    </View> 
  ); 
}; 
 

const styles = StyleSheet.create({ 
  wrapper: { 
    alignItems: 'center', 
    marginTop: -10, 
    marginBottom: 28, 
    position: 'relative', 
  }, 
  image: { 
    marginTop: 10,
    width: 100, 
    height: 100, 
    borderRadius: 50,
    
    borderWidth: 3, 
    borderColor: '#EAE9E2', 
  }, 
  toggleThemeBtn: { 
    position: 'absolute', 
    right: 20, 
    top: 8, 
    backgroundColor: '#000', 
    padding: 6, 
    borderRadius: 16, 
  }, 
}); 
 

export default ProfileAvatar;