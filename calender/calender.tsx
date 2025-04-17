import React, { useState, useEffect } from 'react';
import {
  View,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
} from 'react-native';
import { useRealm, useQuery } from '@realm/react';
import { Expense } from '../database/expenses';
import CalendarHeader from './components/calenderHeader';
import DatePickerHeader from './components/datePickerHeader';
import ExpenseList from './components/expenseList';
import { getCurrentSpendingLimitPeriod } from '../homepage/realmHelpers';  // Import the helper function

const CalendarScreen = () => {
  const realm = useRealm();
  const allExpenses = useQuery(Expense);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredExpenses, setFilteredExpenses] = useState<Realm.Results<Expense> | []>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [spendingLimit, setSpendingLimit] = useState<number>(0);  // Store the spending limit

  useEffect(() => {
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const filtered = allExpenses.filtered(
      'date >= $0 && date < $1',
      startOfDay,
      endOfDay
    );

    setFilteredExpenses(filtered);
  }, [selectedDate, allExpenses]);

  // Calculate the total of the filtered expenses
  const grouptotal = Array.from(filteredExpenses).reduce((sum, expense) => sum + expense.amount, 0);

  // Fetch the spending limit period and update the state
  useEffect(() => {
    const fetchSpendingLimit = async () => {
      const limitPeriod = await getCurrentSpendingLimitPeriod(realm);
      if (limitPeriod) {
        setSpendingLimit(limitPeriod.limit);  // Set the limit if found
      }
    };

    fetchSpendingLimit();
  }, [realm]);

  return (
    <View style={styles.safeArea}>
      <CalendarHeader />
      <View style={styles.container}>
        <DatePickerHeader
          selectedDate={selectedDate}
          onChangeDate={setSelectedDate}
          showDatePicker={showDatePicker}
          setShowDatePicker={setShowDatePicker}
        />

        {/* Display total expenses */}
        <Text style={styles.totalText}>💰 Total: {grouptotal.toFixed(2)}</Text>

        {/* Check if the group total exceeds the spending limit and display warning if necessary */}
        {spendingLimit > 0 && grouptotal > spendingLimit && (
          <Text style={styles.warningText}>
            🚨 You have exceeded your spending limit of {spendingLimit.toFixed(2)}!
          </Text>
        )}

        <ExpenseList expenses={filteredExpenses} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  warningText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 10,
  },
});

export default CalendarScreen;
