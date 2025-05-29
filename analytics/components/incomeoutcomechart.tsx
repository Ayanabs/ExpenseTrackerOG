import React, { useState, useEffect } from 'react';
import { Dimensions, StyleSheet, View, Text, processColor } from 'react-native';
import { BarChart } from 'react-native-charts-wrapper';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const screenWidth = Dimensions.get('window').width;

const IncomeOutcomeChart = ({ selectedMonth }: { selectedMonth: number }) => {
  const [expensesData, setExpensesData] = useState<any[]>([]);
  const [previousMonthExpenses, setPreviousMonthExpenses] = useState<number>(0);
  const [selectedMonthExpenses, setSelectedMonthExpenses] = useState<number>(0);
  const [savings, setSavings] = useState<number>(0);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const currentUser = auth().currentUser;
        if (!currentUser) return;

        const snapshot = await firestore()
          .collection('expenses')
          .where('userId', '==', currentUser.uid)
          .get();

        const expenses = snapshot.docs.map(doc => doc.data());
        setExpensesData(expenses);
      } catch (error) {
        console.error('Error fetching expenses: ', error);
      }
    };

    fetchExpenses();
  }, []);

  const getMonthExpenses = (month: number) => {
    return expensesData.filter((expense) => new Date(expense.date.seconds * 1000).getMonth() === month);
  };

  const calculateTotalExpenses = (month: number) => {
    const monthExpenses = getMonthExpenses(month);
    return monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  useEffect(() => {
    const selectedTotal = calculateTotalExpenses(selectedMonth);
    const previousMonth = (selectedMonth - 1 + 12) % 12;
    const previousTotal = calculateTotalExpenses(previousMonth);
    const calculatedSavings = previousTotal - selectedTotal;

    setSelectedMonthExpenses(selectedTotal);
    setPreviousMonthExpenses(previousTotal);
    setSavings(calculatedSavings);
  }, [selectedMonth, expensesData]);

  const barData = {
    dataSets: [
      {
        values: [
          { y: previousMonthExpenses },
          { y: selectedMonthExpenses },
        ],
        label: 'Monthly Expenses',
        config: {
          colors: [
            processColor('#22C1C3'), 
            processColor(savings >= 0 ? '#4DFF8A' : '#FF4D4D') 
          ],
          valueTextSize: 12,
          valueTextColor: processColor('#333'),
        },
      },
    ],
    config: {
      barWidth: 0.4,
    },
  };

  const xAxis = {
    valueFormatter: ['Previous', 'Selected'],
    granularityEnabled: true,
    granularity: 1,
    position: 'BOTTOM' as const,
    drawLabels: true,
    labelCount: 2,
    axisMinimum: -0.5,
    axisMaximum: 1.5,
    centerAxisLabels: true,
  };

  const yAxis = {
    left: {
      axisMinimum: 0,
    },
    right: {
      enabled: false,
    },
  };

  return (
    <View style={styles.container}>
      <BarChart
        style={styles.chart}
        data={barData}
        xAxis={xAxis}
        yAxis={yAxis}
        legend={{
          enabled: true,
          textSize: 14,
          form: 'SQUARE',
          verticalAlignment: 'BOTTOM',
          horizontalAlignment: 'CENTER',
        }}
        chartDescription={{ text: '' }}
        drawValueAboveBar={true}
        drawBarShadow={false}
      />

      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Selected Month Expenses: Rs. {selectedMonthExpenses}</Text>
        <Text style={[styles.totalText, { color: savings >= 0 ? 'green' : 'red' }]}>
          {savings >= 0 ? `Savings` : `Loss`}: Rs. {Math.abs(savings).toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
    padding: 1,
    marginVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFF',
    elevation: 2,
    minHeight: 120,
  },
  
  
  chart: {
    height: 250,
    width: screenWidth - 32,
    borderRadius: 16,
  },
  totalContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 4,
  },
});

export default IncomeOutcomeChart;
