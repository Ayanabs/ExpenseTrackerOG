import React, { useState, useEffect } from 'react';
import { View, Platform, StatusBar, StyleSheet, Text } from 'react-native';
import firestore from '@react-native-firebase/firestore'; // Import Firestore
import CalendarHeader from './components/calenderHeader';
import DatePickerHeader from './components/datePickerHeader';
import ExpenseList from './components/expenseList';
import DeleteModal from './components/deleteModal';
import EditExpenseModal from './components/editExpenseModal';

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredExpenses, setFilteredExpenses] = useState<any[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [spendingLimit, setSpendingLimit] = useState<number>(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch expenses and current spending limit from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch expenses from Firestore
        const expenseSnapshot = await firestore().collection('expenses').get();
        const expenseData = expenseSnapshot.docs.map(doc => ({
          id: doc.id, // Use Firestore's doc.id as the unique document ID
          ...doc.data(),
        }));

        // Filter expenses based on the selected date
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);

        const filtered = expenseData.filter((expense: any) => {
          const expenseDate = new Date(expense.date.seconds * 1000); // Convert Firestore timestamp to JS Date
          return expenseDate >= startOfDay && expenseDate < endOfDay;
        });

        setFilteredExpenses(filtered);

        // Fetch the spending limit from Firestore
        const limitDoc = await firestore().collection('spendingLimits').doc('currentLimit').get();
        if (limitDoc.exists) {
          const limitData = limitDoc.data();
          if (limitData) {
            setSpendingLimit(limitData.limit);
          }
        }
      } catch (error) {
        console.error('Error fetching data from Firestore:', error);
      }
    };

    fetchData();
  }, [selectedDate]);

  // Calculate the total amount spent for the filtered expenses
  const grouptotal = filteredExpenses.reduce((sum: number, expense: { amount: number }) => sum + expense.amount, 0);

  // Handle delete expense by doc.id (Firestore Document ID)
  const handleDelete = async () => {
    if (selectedExpense) {
      try {
        // Delete expense from Firestore using Firestore's document ID (doc.id)
        await firestore().collection('expenses').doc(selectedExpense.id).delete(); // Use `id` which is the Firestore document ID
        setFilteredExpenses(filteredExpenses.filter((expense: any) => expense.id !== selectedExpense.id)); // Update the state by filtering out the deleted expense
        setShowDeleteModal(false); // Close the delete modal
        setSelectedExpense(null); // Reset selected expense
      } catch (error) {
        console.error('Error deleting expense from Firestore:', error);
      }
    }
  };

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
        <Text style={styles.totalText}>💰 Total: {grouptotal.toFixed(2)}</Text>

        {spendingLimit > 0 && grouptotal > spendingLimit && (
          <Text style={styles.warningText}>
            🚨 You have exceeded your spending limit of {spendingLimit.toFixed(2)}!
          </Text>
        )}

        <ExpenseList
          expenses={filteredExpenses}
          onEdit={(expense: any) => {
            setSelectedExpense(expense);
            setShowEditModal(true);
          } }
          onDelete={(expense: any) => {
            setSelectedExpense(expense);
            setShowDeleteModal(true);
          } } onClose={function (): void {
            throw new Error('Function not implemented.');
          } }        />

        {showDeleteModal && selectedExpense && (
          <DeleteModal
            expenseId={selectedExpense.id} // Pass Firestore document ID (id) to the DeleteModal
            onCancel={() => {
              setShowDeleteModal(false);
              setSelectedExpense(null);
            }}
            onDelete={handleDelete} // Trigger handleDelete function when confirmed
          />
        )}

        {showEditModal && selectedExpense && (
          <EditExpenseModal
            expenses={selectedExpense}
            onClose={() => {
              setShowEditModal(false);
              setSelectedExpense(null);
            } } onEdit={function (expense: any): void {
              throw new Error('Function not implemented.');
            } } onDelete={function (expense: any): void {
              throw new Error('Function not implemented.');
            } }          />
        )}
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
