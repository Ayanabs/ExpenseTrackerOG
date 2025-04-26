import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getFirestore } from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

interface MonthlyBudgetCardProps {
  selectedMonth: number;
  totalSpent: number;
}

const MonthlyBudgetCard: React.FC<MonthlyBudgetCardProps> = ({ selectedMonth, totalSpent }) => {
  const [currentLimit, setCurrentLimit] = useState<number>(0); // Budget limit for the month
  const [remainingBudget, setRemainingBudget] = useState<number>(0); // Remaining budget for the month

  // Fetch spending limit data when component mounts
  useEffect(() => {
    const fetchSpendingLimit = async () => {
      try {
        const currentUser = auth().currentUser;
        if (!currentUser) return;

        // Fetch the spending limit for the logged-in user
        const snapshot = await getFirestore()
          .collection('spendingLimits')
          .where('userId', '==', currentUser.uid)  // Filter by userId
          .get();

        // If we find a document for the current user, set the spending limit
        if (!snapshot.empty) {
          snapshot.forEach(doc => {
            const limitData = doc.data();
            if (limitData) {
              setCurrentLimit(limitData.limit);
            }
          });
        }
      } catch (error) {
        console.error('Error fetching spending limit:', error);
      }
    };

    fetchSpendingLimit();
  }, [selectedMonth]); // Re-fetch when selectedMonth changes

  // Calculate remaining budget
  useEffect(() => {
    setRemainingBudget(currentLimit - totalSpent); // Remaining budget = limit - total spent
  }, [currentLimit, totalSpent]);

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
        <Text style={{ color: '#5CB85C' }}>Rs.{remainingBudget > 0 ? remainingBudget : 0}</Text>
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
