// components/ExpenseList.tsx
import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { Expense } from '../../database/expenses';

type Props = {
  expenses: Realm.Results<Expense> | [];
};

const ExpenseList: React.FC<Props> = ({ expenses }) => {
  return (
    <>
      <Text style={styles.title}>Expenses:</Text>
      <FlatList
        data={expenses}
        keyExtractor={(item: any) => item._id.toHexString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>💵 Amount: {item.amount}</Text>
            <Text>🏷️ Category: {item.category}</Text>
            <Text>🗓️ Date: {item.date.toDateString()}</Text>
            <Text>📄 Source: {item.source}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No expenses for this day.</Text>
        }
      />
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: '600',
  },
  item: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  empty: {
    marginTop: 20,
    fontStyle: 'italic',
  },
});

export default ExpenseList;
