import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

interface MonthlyBudgetCardProps {
  selectedMonth: number; 
}

const MonthlyBudgetCard: React.FC<MonthlyBudgetCardProps> = ({ selectedMonth }) => {
  const [currentLimit, setCurrentLimit] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [remainingBudget, setRemainingBudget] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Get current year
  const currentYear = new Date().getFullYear();
  
  // Check authentication state
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      setIsLoggedIn(!!user);
      
      if (!user) {
        setCurrentLimit(0);
        setTotalSpent(0);
        setRemainingBudget(0);
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  // Fetch data when user is logged in and month changes
  useEffect(() => {
    const fetchUserBudgetData = async () => {
      setLoading(true);
      try {
        const currentUser = auth().currentUser;
        
        if (!currentUser) {
          setLoading(false);
          return;
        }
        
        // Fetch spending limit
        let limitValue = 30000; 
        
        try {
          const limitSnapshot = await firestore()
            .collection('spendingLimits')
            .where('userId', '==', currentUser.uid)
            .get();
          
          if (!limitSnapshot.empty) {
           
            const limitDoc = limitSnapshot.docs[0].data();
            if (limitDoc && limitDoc.limit) {
              limitValue = parseFloat(limitDoc.limit);
            }
          }
        } catch (limitError) {
          console.error('Error fetching spending limit:', limitError);
        }
        
        setCurrentLimit(limitValue);
        
        // Calculate start and end dates for the selected month
        
        const startDate = new Date(currentYear, selectedMonth, 1);
        const endDate = new Date(currentYear, selectedMonth + 1, 0);
        
        console.log(`Fetching expenses from ${startDate.toISOString()} to ${endDate.toISOString()}`);
        
        // Fetch expenses for the current user within the date range
        const expensesSnapshot = await firestore()
          .collection('expenses')
          .where('userId', '==', currentUser.uid)
          .where('date', '>=', startDate)
          .where('date', '<=', endDate)
          .get();
        
        // Calculate total spent from expenses
        let monthlySpent = 0;
        
        expensesSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.amount) {
            monthlySpent += parseFloat(data.amount);
          }
        });
        
        setTotalSpent(monthlySpent);
        
      } catch (error) {
        console.error('Error fetching user budget data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (isLoggedIn) {
      fetchUserBudgetData();
    }
  }, [selectedMonth, isLoggedIn]);
  
  // Calculate remaining budget
  useEffect(() => {
    setRemainingBudget(currentLimit - totalSpent);
  }, [currentLimit, totalSpent]);
  
  
  if (!isLoggedIn) {
    return null;
  }
  
  
  if (loading) {
    return (
      <View style={styles.card}>
        <Text style={styles.label}>Loading budget data...</Text>
      </View>
    );
  }
  
  // Calculate daily budget
  const daysInMonth = new Date(currentYear, selectedMonth + 1, 0).getDate();
  const dailyBudget = currentLimit / daysInMonth;
  
  // Calculate progress percentage
  const progressPercentage = currentLimit > 0 
    ? Math.min((totalSpent / currentLimit) * 100, 100) 
    : 0;
  
  // Determine the color of the progress bar
  const getProgressColor = () => {
    if (progressPercentage > 90) return '#FF5252'; 
    if (progressPercentage > 75) return '#FFC107';
    return '#5CB85C'; 
  };

  // Get month name for display
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 
                 'August', 'September', 'October', 'November', 'December'];
  const monthName = months[selectedMonth];

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{monthName} Budget</Text>
      <View style={styles.amountContainer}>
        <Text style={styles.amount}>Rs.{totalSpent.toFixed(0)}</Text>
        <Text style={styles.of}> / Rs.{currentLimit.toFixed(0)}</Text>
      </View>
      
      <View style={styles.barContainer}>
        <View 
          style={[
            styles.barFill, 
            { 
              width: `${progressPercentage}%`,
              backgroundColor: getProgressColor() 
            }
          ]} 
        />
      </View>
      
      <Text style={styles.summary}>
        Daily budget was ~ Rs.{dailyBudget.toFixed(0)} - Rs.{(dailyBudget + 40).toFixed(0)}, 
        Saved Rs.{remainingBudget > 0 ? remainingBudget.toFixed(0) : '0'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    elevation: 2,
    minHeight: 120,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
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
    height: 8,
    borderRadius: 4,
  },
  summary: {
    fontSize: 12,
    color: '#666',
  },
});

export default MonthlyBudgetCard;