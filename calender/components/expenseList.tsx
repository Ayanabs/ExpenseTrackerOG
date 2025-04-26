import React from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';

type Props = {
  expenses: any[]; // Expenses will be of type any[]
  onEdit: (expense: any) => void; // Accepting a general expense object
  onDelete: (expense: any) => void; // Accepting a general expense object
  onClose: () => void; // Add the onClose property to the Props type
};

const ExpenseList: React.FC<Props> = ({ expenses, onEdit, onDelete }) => {
  return (
    <>
      <Text style={styles.title}>Expenses:</Text>
      <FlatList
        data={expenses}
        keyExtractor={(item: any) => item.id} // Use Firestore document id as the key
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>💵 Amount: {item.amount}</Text>
            <Text>🏷️ Category: {item.category}</Text>
            <Text>🗓️ Date: {item.date ? item.date.toDate().toDateString() : 'N/A'}</Text> {/* Handle Firestore Timestamp */}
            <Text>📄 Source: {item.source}</Text>

            <View style={styles.actions}>
              <TouchableOpacity onPress={() => onEdit(item)}>
                <Text style={styles.edit}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDelete(item)}>
                <Text style={styles.delete}>Delete</Text>
              </TouchableOpacity>
            </View>
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  edit: {
    color: 'blue',
    marginRight: 15,
  },
  delete: {
    color: 'red',
  },
  empty: {
    marginTop: 20,
    fontStyle: 'italic',
  },
});

export default ExpenseList;
