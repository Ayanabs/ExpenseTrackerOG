import React, { useState, useEffect } from 'react';  
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from 'react-native'; 
import AnalyticsHeader from '../analytics/components/analyticsheader'; 
import MonthSelector from '../analytics/components/monthselector'; 
import IncomeOutcomeChart from '../analytics/components/incomeoutcomechart'; 
import MonthlyBudgetCard from '../analytics/components/monthlybudgetcard'; // Import MonthlyBudgetCard
import CategoryListContainer from '../homepage/components/categorylist'; 
import { getGroupedExpensesByCategory } from '../homepage/components/categorygroupexpense'; 
import { getFirestore } from '@react-native-firebase/firestore'; // Import firestore to get the total spent

const styles = StyleSheet.create({
  safeArea: {
      flex: 1,
  },
});

const AnalyticsScreen = () => { 
  const [categories, setCategories] = useState<any[]>([]); // State to store categories
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); // Default to current month
  const [totalSpent, setTotalSpent] = useState<number>(0); // State to hold totalSpent
  
  // Fetch the totalSpent for the selected month (this should only happen once on initial load)
  useEffect(() => {
    const fetchTotalSpent = async () => {
      try {
        const snapshot = await getFirestore().collection('expenses')
          .where('date', '>=', new Date(new Date().getFullYear(), selectedMonth, 1))  // Start of the selected month
          .where('date', '<=', new Date(new Date().getFullYear(), selectedMonth + 1, 0)) // End of the selected month
          .get();

        const expenses = snapshot.docs.map(doc => doc.data());
        const totalSpentValue = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        setTotalSpent(totalSpentValue); // Set totalSpent value
      } catch (error) {
        console.error('Error fetching totalSpent:', error);
      }
    };

    fetchTotalSpent();
  }, [selectedMonth]); // Re-fetch when selectedMonth changes

  // Fetch category data from Firestore
  useEffect(() => {
    const loadCategories = async () => {
      const fetchedCategories = await getGroupedExpensesByCategory(); // Fetch categories from your function
      setCategories(fetchedCategories); // Update categories state
    };

    loadCategories();
  }, []); // Empty dependency array ensures this runs once when the component is mounted

  // Handle month selection from the MonthSelector
  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month); // Update the selected month
  };

  return ( 
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={{ backgroundColor: '#FAFAFA' }}> 
        <AnalyticsHeader /> 
        <MonthSelector selectedMonth={selectedMonth} onMonthSelect={handleMonthSelect} /> 
        <IncomeOutcomeChart selectedMonth={selectedMonth} /> {/* Pass selectedMonth to IncomeOutcomeChart */}
        {/* Pass both selectedMonth and totalSpent to MonthlyBudgetCard */}
        <MonthlyBudgetCard selectedMonth={selectedMonth} totalSpent={totalSpent} /> 
        <CategoryListContainer categories={categories} />
      </ScrollView> 
    </SafeAreaView>
  ); 
}; 

export default AnalyticsScreen;
