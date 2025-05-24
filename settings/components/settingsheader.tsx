import { useNavigation } from '@react-navigation/native';
import React from 'react'; 
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'; 
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
import { COLORS } from '../../theme';
 

const SettingsHeader = () => { 
  const navigation = useNavigation(); 
  return (
  <View style={styles.containersettings}> 
    <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={24} color={COLORS.white} />
            </TouchableOpacity>
    <Text style={styles.title}>Settings</Text> 
    <View style={{ width: 24 }} />  
  </View> 
  );
}; 
  

const styles = StyleSheet.create({ 
  containersettings: { 
    backgroundColor: 'transparent', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: '20%', 
  }, 
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: COLORS.white,
  }, 
}); 
 

export default SettingsHeader;