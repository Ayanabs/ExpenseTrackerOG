import React, { useState } from 'react'; 
import { View, Text, StyleSheet, Switch } from 'react-native'; 
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
 

const AlertsToggle = () => { 
  const [enabled, setEnabled] = useState(true); 
 

return ( 
    <View style={styles.container}> 
      <Icon name="alert-circle-outline" size={20} color="#FFF" /> 
      <Text style={styles.label}>Alerts</Text> 
      <Switch 
        value={enabled} 
        onValueChange={setEnabled} 
        trackColor={{ false: '#888', true: '#4CD964' }} 
        thumbColor="#FFF" 
      /> 
    </View> 
  ); 
}; 
 

const styles = StyleSheet.create({ 
  container: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#3A3A3A', 
    padding: 14, 
    borderRadius: 12, 
    margin: 20, 
    justifyContent: 'space-between', 
  }, 
  label: { 
    color: '#FFF', 
    flex: 1, 
    marginLeft: 10, 
  }, 
}); 
 

export default AlertsToggle;