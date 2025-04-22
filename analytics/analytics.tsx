import React, { useState, useEffect } from 'react';  
import { SafeAreaView, ScrollView, View } from 'react-native'; 
import AnalyticsHeader from '../analytics/components/analyticsheader'; 
import MonthSelector from '../analytics/components/monthselector'; 
import IncomeOutcomeChart from '../analytics/components/incomeoutcomechart'; 
import MonthlyBudgetCard from '../analytics/components/monthlybudgetcard'; 
import CategoryListContainer from '../homepage/components/categorylist'; 
import { StyleSheet } from 'react-native';
import { COLORS } from '../theme';
import { getGroupedExpensesByCategory } from '../homepage/components/categorygroupexpense'; // Assuming you have this function

const styles = StyleSheet.create({
  safeArea: {
      flex: 1,
  },
});

const AnalyticsScreen = () => { 
  const [categories, setCategories] = useState<any[]>([]); // State to store categories

  useEffect(() => {
    const loadCategories = async () => {
      const fetchedCategories = await getGroupedExpensesByCategory(); // Fetch categories from your function
      setCategories(fetchedCategories); // Update categories state
    };

    loadCategories();
  }, []); // Empty dependency array ensures this runs once when the component is mounted

  return ( 
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={{ backgroundColor: '#FAFAFA' }}> 
        <AnalyticsHeader /> 
        <MonthSelector /> 
        <IncomeOutcomeChart /> 
        <MonthlyBudgetCard /> 
        {/* Pass the categories state to CategoryListContainer */}
        <CategoryListContainer categories={categories} />
      </ScrollView> 
    </SafeAreaView>
  ); 
}; 

export default AnalyticsScreen;
