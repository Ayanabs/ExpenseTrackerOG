import React from 'react'; 
import { SafeAreaView, ScrollView, View } from 'react-native'; 
import AnalyticsHeader from '../analytics/components/analyticsheader'; 
import MonthSelector from '../analytics/components/monthselector'; 
import IncomeOutcomeChart from '../analytics/components/incomeoutcomechart'; 
import MonthlyBudgetCard from '../analytics/components/monthlybudgetcard'; 
import CategoryListContainer from '../homepage/components/categorylist'; 
 

import { StyleSheet } from 'react-native';
import { COLORS } from '../theme';
 
const styles = StyleSheet.create({
  safeArea: {
      flex: 1,
     
    },
});

const AnalyticsScreen = () => { 
  return ( 
      <SafeAreaView style={styles.safeArea}>
    <ScrollView style={{ backgroundColor: '#FAFAFA' }}> 
      <AnalyticsHeader /> 
      <MonthSelector /> 
      <IncomeOutcomeChart /> 
      <MonthlyBudgetCard /> 
      <CategoryListContainer/> 
    </ScrollView> 
    </SafeAreaView>
  ); 
}; 
 

export default AnalyticsScreen; 
