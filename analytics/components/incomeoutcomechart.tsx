import React, { useState, useEffect } from 'react';
import { Dimensions, StyleSheet, View, Text, processColor } from 'react-native';
import { LineChart } from 'react-native-charts-wrapper';  // Using LineChart
import { db } from '../../database/firebaseConfig'; // Import firebase config
import { collection, getDocs } from 'firebase/firestore';

const screenWidth = Dimensions.get('window').width;

const IncomeOutcomeChart = ({ selectedMonth }: { selectedMonth: number }) => {
  const [expensesData, setExpensesData] = useState<any[]>([]); // State to hold expenses data
  const [previousMonthExpenses, setPreviousMonthExpenses] = useState<number>(0); // Store previous month's expenses
  const [selectedMonthExpenses, setSelectedMonthExpenses] = useState<number>(0); // Store selected month's expenses
  const [savings, setSavings] = useState<number>(0); // Store savings (difference in expenses)

  // Fetch expenses data from Firestore
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const expensesCollection = collection(db, 'expenses'); // Fetch expenses collection
        const snapshot = await getDocs(expensesCollection); // Get all expenses
        const expenses = snapshot.docs.map((doc) => doc.data()); // Extract data
        setExpensesData(expenses); // Set expenses data to state
      } catch (error) {
        console.error('Error fetching expenses: ', error);
      }
    };
    fetchExpenses();
  }, []); // Empty dependency array to run once when the component mounts

  // Filter expenses by month
  const getMonthExpenses = (month: number) => {
    return expensesData.filter((expense) => new Date(expense.date.seconds * 1000).getMonth() === month);
  };

  // Calculate total expenses for a given month
  const calculateTotalExpenses = (month: number) => {
    const monthExpenses = getMonthExpenses(month);
    return monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  // Update expenses for selected and previous months
  useEffect(() => {
    // Calculate expenses for the selected month
    const selectedMonthTotal = calculateTotalExpenses(selectedMonth);
    setSelectedMonthExpenses(selectedMonthTotal);

    // Calculate expenses for the previous month
    const previousMonth = (selectedMonth - 1 + 12) % 12; // Get previous month's index
    const previousMonthTotal = calculateTotalExpenses(previousMonth);
    setPreviousMonthExpenses(previousMonthTotal);

    // Calculate savings (difference in expenses)
    const savings = previousMonthTotal - selectedMonthTotal;
    setSavings(savings); // Savings is the reduction in expenses
  }, [selectedMonth, expensesData]); // Re-run when selectedMonth or expensesData changes

  // Prepare the data for the chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const data = {
    dataSets: [
      {
        values: [
          {
            x: selectedMonthExpenses, // X-axis will show the expense amounts for selected month
            y: selectedMonth, // Y-axis will represent selected month's expenses
          },
        ],
        label: 'Selected Month Expenses',
        config: {
          color: processColor('rgb(220, 53, 69)'), // Red for selected month's expenses
          lineWidth: 3,
          drawValues: false, // Don't display values on the line points
          drawCircles: false, // Don't display circles on the data points
          drawFilled: true, // Fill the area under the curve
          fillColor: processColor('rgba(220, 53, 69, 0.3)'), // Fill color for the area
          fillAlpha: 50, // Transparency for the fill color
        },
      },
      {
        values: [
          {
            x: previousMonthExpenses, // X-axis will show the expense amounts for previous month
            y: (selectedMonth - 1 + 12) % 12, // Y-axis will represent previous month's expenses
          },
        ],
        label: 'Previous Month Expenses',
        config: {
          color: processColor('rgb(34, 193, 195)'), // Teal for previous month's expenses
          lineWidth: 3,
          drawValues: false, // Don't display values on the line points
          drawCircles: false, // Don't display circles on the data points
          drawFilled: true, // Fill the area under the curve
          fillColor: processColor('rgba(34, 193, 195, 0.3)'), // Fill color for the area
          fillAlpha: 50, // Transparency for the fill color
        },
      },
      {
        values: [
          {
            x: savings, // Savings will be the difference between selected and previous month's expenses
            y: selectedMonth, // Y-axis will represent savings (on the same Y-axis as expenses)
          },
        ],
        label: 'Savings',
        config: {
          color: processColor(savings < 0 ? 'rgb(255, 0, 0)' : 'rgb(77, 255, 138)'), // Red for overspending, green for savings
          lineWidth: 3,
          drawValues: false, // Don't display values on the line points
          drawCircles: false, // Don't display circles on the data points
          drawFilled: true, // Fill the area under the curve
          fillColor: processColor(savings < 0 ? 'rgba(255, 0, 0, 0.3)' : 'rgba(77, 255, 138, 0.3)'), // Fill color for savings
          fillAlpha: 50, // Transparency for the fill color
        },
      },
    ],
  };

  // Y-axis dynamically scaled based on the maximum total expense
  const yAxis = {
    left: {
      axisMaximum: months.length,  // Set to the number of months (12)
      axisMinimum: 0,
      labelCount: 6,
    },
    right: {
      axisMaximum: months.length,
      axisMinimum: 0,
      labelCount: 6,
    },
  };

  // X-axis for expenses amounts
  const xAxis = {
    position: 'BOTTOM' as 'BOTTOM',
    granularityEnabled: true,
    granularity: 1000, // You can change the granularity based on the range of expense amounts
    axisMaximum: Math.max(...expensesData.map((exp) => exp.amount)) + 5000,
    axisMinimum: 0,
    drawLabels: true,
    valueFormatter: expensesData.map((expense) => `Rs. ${expense.amount}`), // Format X-axis as currency (expense amount)
  };

  return (
    <View style={styles.container}>
      <LineChart
        style={styles.chart}
        data={data}
        xAxis={xAxis}
        yAxis={yAxis}
        chartDescription={{ text: '' }}
        legend={{
          enabled: true,
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'BOTTOM',
          orientation: 'HORIZONTAL',
        }}
        drawBorders={false}
      />
      {/* Display total expenses */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total Expenses: Rs. {selectedMonthExpenses}</Text>
        <Text style={styles.totalText}>Savings (Current Month vs Previous): Rs. {savings}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 10,
  },
  chart: {
    height: 220,
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
    color: '#333',
    marginVertical: 4,
  },
});

export default IncomeOutcomeChart;
