import React from 'react'; 
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native'; 
import { COLORS } from '../../theme'; 

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; 

const MonthSelector = ({ selectedMonth, onMonthSelect }: { selectedMonth: number, onMonthSelect: (month: number) => void }) => {
  return ( 
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}> 
      {months.map((month, index) => ( 
        <TouchableOpacity 
          key={index} 
          style={[styles.chip, index === selectedMonth && styles.activeChip]} 
          onPress={() => {
            onMonthSelect(index); // Pass selected month to parent
          }}
        >
          <Text style={[styles.chipText, index === selectedMonth && styles.activeChipText]}>
            {month}
          </Text> 
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
