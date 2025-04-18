import { useNavigation } from '@react-navigation/native';
import React from 'react'; 
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'; 
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
import { COLORS } from '../../theme';
 

const SettingsHeader = () => { 
  const navigation = useNavigation(); 
  return (
  <View style={styles.container}> 
    <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={24} color={COLORS.black} />
            </TouchableOpacity>
    <Text style={styles.title}>Settings</Text> 
    <View style={{ width: 24 }} /> {/* Spacer for symmetry */} 
  </View> 
  );
}; 
  

const styles = StyleSheet.create({ 
  container: { 
    backgroundColor: '#EAE9E2', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 25, 
  }, 
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
  }, 
}); 
 

export default SettingsHeader;