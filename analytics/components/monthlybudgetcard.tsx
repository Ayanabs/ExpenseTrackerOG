import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { db } from '../../database/firebaseConfig'; // Import firebase config
import { collection, getDocs, query, where } from 'firebase/firestore'; // Firestore imports

interface MonthlyBudgetCardProps {
  selectedMonth: number; // Declare selectedMonth in the props type
  totalSpent: number; // Add totalSpent as a required prop
}

const MonthlyBudgetCard: React.FC<MonthlyBudgetCardProps> = ({ selectedMonth, totalSpent }) => {
  const [currentLimit, setCurrentLimit] = useState<number>(0); // Budget limit for the month

  // Fetch spending limit data when component mounts
  useEffect(() => {
    const fetchSpendingLimit = async () => {
      try {
        // Fetch the spending limit for the selected month
        const spendingLimitDoc = await getDocs(collection(db, 'spendingLimits'));
        spendingLimitDoc.forEach((doc) => {
          setCurrentLimit(doc.data().limit); // Assuming the limit is stored as 'limit' in the document
        });
      } catch (error) {
        console.error('Error fetching spending limit:', error);
      }
    };

    fetchSpendingLimit();
  }, [selectedMonth]); // Fetch spending limit when selectedMonth changes

  // Calculate remaining budget
  const remainingBudget = currentLimit - totalSpent;
  const savings = remainingBudget > 0 ? remainingBudget : 0; // Assuming savings is the leftover amount

  // Static values for budget and max budget
  const dailyBudget = currentLimit / 30; // Assuming 30 days in a month for simplicity

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Monthly Budget</Text>
      <Text style={styles.amount}>
        Rs.{totalSpent}
        <Text style={styles.of}> / Rs.{currentLimit}</Text>
      </Text>
      <View style={styles.barContainer}>
        <View style={[styles.barFill, { width: `${(totalSpent / currentLimit) * 100}%` }]} />
      </View>
      <Text style={styles.summary}>
        Daily budget was ~ Rs.{dailyBudget.toFixed(0)} - Rs.{(dailyBudget + 40).toFixed(0)}, Saved{' '}
        <Text style={{ color: '#5CB85C' }}>Rs.{savings}</Text>
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
    height: 8,
    backgroundColor: '#5CB85C', // Primary color for the progress bar
    borderRadius: 4,
  },
  summary: {
    fontSize: 12,
    color: '#666',
  },
});

export default MonthlyBudgetCard;
