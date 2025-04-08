import React from 'react'; 
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'; 
import { COLORS } from '../../theme'; 
 

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']; 
 

const MonthSelector = () => { 
  return ( 
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}> 
      {months.map((month, index) => ( 
        <TouchableOpacity key={index} style={[styles.chip, index === 0 && styles.activeChip]}> 
          <Text style={[styles.chipText, index === 0 && styles.activeChipText]}>{month}</Text> 
        </TouchableOpacity> 
      ))} 
    </ScrollView> 
  ); 
}; 
 

const styles = StyleSheet.create({ 
  container: { 
    paddingHorizontal: 16, 
    marginVertical: 10, 
  }, 
  chip: { 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    backgroundColor: '#E0E0E0', 
    borderRadius: 20, 
    marginRight: 8, 
  }, 
  activeChip: { 
    backgroundColor: COLORS.primary, 
  }, 
  chipText: { 
    color: '#333', 
  }, 
  activeChipText: { 
    color: '#FFF', 
    fontWeight: 'bold', 
  }, 
}); 
 

export default MonthSelector; 
 