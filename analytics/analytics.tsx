import React, { useState, useEffect } from 'react';  
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from 'react-native'; 
import AnalyticsHeader from '../analytics/components/analyticsheader'; 
import MonthSelector from '../analytics/components/monthselector'; 
import IncomeOutcomeChart from '../analytics/components/incomeoutcomechart'; 
import MonthlyBudgetCard from '../analytics/components/monthlybudgetcard'; 
import CategoriesContainer from '../homepage/components/categorylist'; 
import { fetchCategoriesWithExpenses } from '../homepage/components/categoryservice'; 
import { getFirestore } from '@react-native-firebase/firestore';
import { COLORS } from '../theme';

const styles = StyleSheet.create({
  safeArea: {
      flex: 1,
  },
});

const AnalyticsScreen = () => { 
  const [categories, setCategories] = useState<any[]>([]); 
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); 
  const [totalSpent, setTotalSpent] = useState<number>(0); 
  
  // Fetch the totalSpent for the selected month (this should only happen once on initial load)
  useEffect(() => {
    const fetchTotalSpent = async () => {
      try {
        const snapshot = await getFirestore().collection('expenses')
          .where('date', '>=', new Date(new Date().getFullYear(), selectedMonth, 1))  
          .where('date', '<=', new Date(new Date().getFullYear(), selectedMonth + 1, 0)) 
          .get();

        const expenses = snapshot.docs.map(doc => doc.data());
        const totalSpentValue = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        setTotalSpent(totalSpentValue); // Set totalSpent value
      } catch (error) {
        console.error('Error fetching totalSpent:', error);
      }
    };

    fetchTotalSpent();
  }, [selectedMonth]); 

  // Fetch category data from Firestore
  useEffect(() => {
    const loadCategories = async () => {
      const fetchedCategories = await fetchCategoriesWithExpenses();
      setCategories(fetchedCategories);
    };

    loadCategories();
  }, []); 

  // Handle month selection from the MonthSelector
  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month); // Update the selected month
  };

  return ( 
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={{ backgroundColor: COLORS.background }}> 
        <AnalyticsHeader /> 
        <MonthSelector selectedMonth={selectedMonth} onMonthSelect={handleMonthSelect} /> 
        <IncomeOutcomeChart selectedMonth={selectedMonth} /> {/* Pass selectedMonth to IncomeOutcomeChart */}
        {/* Pass both selectedMonth and totalSpent to MonthlyBudgetCard */}
        <MonthlyBudgetCard selectedMonth={selectedMonth} /> 
        <CategoriesContainer categories={categories} isLoading={false} />
      </ScrollView> 
    </SafeAreaView>
  ); 
}; 

export default AnalyticsScreen;
