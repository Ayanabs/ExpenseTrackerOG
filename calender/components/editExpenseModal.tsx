import React, { useState } from 'react';
import {View,Text, TextInput,TouchableOpacity,Modal, StyleSheet} from 'react-native';
import firestore from '@react-native-firebase/firestore';

interface Expense {
  id: string;
  amount: number;
  category: string;
}

interface EditExpenseModalProps {
  expenses: Expense;
  onClose: () => void;
  onEdit: () => void;
}

const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  expenses,
  onClose,
  onEdit,
}) => {
  const [amount, setAmount] = useState(expenses.amount.toString());
  const [category, setCategory] = useState(expenses.category);

  const handleSave = async () => {
    try {
      await firestore()
        .collection('expenses')
        .doc(expenses.id)
        .update({
          amount: parseFloat(amount),
          category: category,
        });
      onEdit();
      onClose();
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Edit Expense</Text>
          <Text style={styles.title}>Amount</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="Amount"
          />
          <Text style={styles.title}>Category</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="Category"
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={styles.sideButtonCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSave} style={styles.sideButton}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>

            
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EditExpenseModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    marginHorizontal: 30,
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  sideButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  sideButtonCancel: {
    flex: 1,
    backgroundColor: '#9e9e9e',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
