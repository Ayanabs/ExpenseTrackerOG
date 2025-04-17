import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRealm, useQuery } from '@realm/react';
import { Expense } from '../database/expenses'; // Adjust path if needed
import CalenderHeader from './components/calenderHeader'; // Adjust this path to match your structure

const Calendar = () => {
  const realm = useRealm();
  const allExpenses = useQuery(Expense);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredExpenses, setFilteredExpenses] = useState<Realm.Results<Expense> | []>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  const onChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <View style={styles.safeArea}>
      <CalenderHeader />

      <View style={styles.container}>
        <Text
          style={styles.dateLabel}
          onPress={() => setShowDatePicker(true)}
        >
          📅 Select Date: {selectedDate.toDateString()}
        </Text>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={onChange}
          />
        )}

        <Text style={styles.expenseTitle}>Expenses:</Text>

        <FlatList
          data={filteredExpenses}
          keyExtractor={(item: any) => item._id.toHexString()}
          renderItem={({ item }) => (
            <View style={styles.expenseItem}>
              <Text>💵 Amount: {item.amount}</Text>
              <Text>🏷️ Category: {item.category}</Text>
              <Text>🗓️ Date: {item.date.toDateString()}</Text>
              <Text>📄 Source: {item.source}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyMessage}>No expenses for this day.</Text>}
        />
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
  dateLabel: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 10,
  },
  expenseTitle: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: '600',
  },
  expenseItem: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  emptyMessage: {
    marginTop: 20,
    fontStyle: 'italic',
  },
});

export default Calendar;
