import React from 'react'; 
import { View, Text, StyleSheet } from 'react-native'; 
import { COLORS } from '../../theme'; 
 

const MonthlyBudgetCard = () => ( 
  <View style={styles.card}> 
    <Text style={styles.label}>Monthly Budget</Text> 
    <Text style={styles.amount}>Rs.5580 <Text style={styles.of}>/ Rs.8020</Text></Text> 
    <View style={styles.barContainer}> 
      <View style={styles.barFill} /> 
    </View> 
    <Text style={styles.summary}>Daily budget was ~ Rs.1080 - 1120, Saved <Text style={{ color: COLORS.primary }}>Rs.40</Text></Text> 
  </View> 
); 
 

const styles = StyleSheet.create({ 
  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 12, 
    padding: 16, 
    marginHorizontal: 16, 
    marginTop: 12, 
    elevation: 2, 
  }, 
  label: { 
    fontSize: 14, 
    color: '#666', 
  }, 
  amount: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginVertical: 4, 
  }, 
  of: { 
    fontSize: 14, 
    color: '#999', 
  }, 
  barContainer: { 
    height: 8, 
    backgroundColor: '#EEE', 
    borderRadius: 4, 
    marginVertical: 8, 
  }, 
  barFill: { 
    width: '25%', 
    height: 8, 
    backgroundColor: COLORS.primary, 
    borderRadius: 4, 
  }, 
  summary: { 
    fontSize: 12, 
    color: '#666', 
  }, 
}); 
 

export default MonthlyBudgetCard; 
