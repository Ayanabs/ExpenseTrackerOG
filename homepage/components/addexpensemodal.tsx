import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { COLORS } from '../../theme';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onExpenseAdded: () => void;
}

const CATEGORIES = [
  'Food & Dining',
  'Shopping',
  'Transportation',
  'Bills & Utilities',
  'Entertainment',
  'Healthcare',
  'Education',
  'Travel',
  'Groceries',
  'Fuel',
  'Other',
  'Uncategorized',
];

export default function AddExpenseModal({
  visible,
  onClose,
  onExpenseAdded,
}: AddExpenseModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Uncategorized');
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showCategories, setShowCategories] = useState<boolean>(false);

  const resetForm = () => {
    setAmount('');
    setCategory('Uncategorized');
    setDescription('');
    setIsLoading(false);
    setShowCategories(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddExpense = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    const currentUser = auth().currentUser;
    if (!currentUser) {
      Alert.alert('Error', 'No authenticated user found');
      return;
    }

    try {
      setIsLoading(true);
      const expenseAmount = parseFloat(parseFloat(amount).toFixed(2));

      await firestore().collection('expenses').add({
        amount: expenseAmount,
        source: 'Manual Entry',
        date: firestore.Timestamp.fromDate(new Date()),
        category: category,
        description: description.trim() || null,
        currency: 'LKR',
        userId: currentUser.uid,
        createdAt: firestore.Timestamp.fromDate(new Date()),
      });

      Alert.alert('Success', `Expense of Rs ${expenseAmount.toFixed(2)} added successfully!`, [
        {
          text: 'OK',
          onPress: () => {
            onExpenseAdded();
            handleClose();
          },
        },
      ]);
    } catch (error) {
      console.error('Error adding manual expense:', error);
      Alert.alert('Error', 'Failed to add expense. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Main Add Expense Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={handleClose}
      >
        <Pressable style={styles.modalOverlay} onPress={handleClose}>
          <View style={styles.modalView}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.modalTitle}>Add Expense</Text>
              
              {/* Amount Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Amount (LKR)</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currencyText}>Rs</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="10000"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                    placeholderTextColor="#9e9e9e"
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Category Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                <TouchableOpacity
                  style={styles.categoryWrapper}
                  onPress={() => setShowCategories(true)}
                  disabled={isLoading}
                >
                  <Icon name="tag-outline" size={20} color={COLORS.primary} style={styles.inputIcon}/>
                  <Text style={styles.categoryText}>{category}</Text>
                  <Icon name="chevron-down" size={20} color={COLORS.gray} />
                </TouchableOpacity>
              </View>

             
              
              {/* Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={handleClose}
                  disabled={isLoading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.addButton, isLoading && styles.disabledButton]} 
                  onPress={handleAddExpense}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.addButtonText}>
                    {isLoading ? 'Adding...' : 'Add Expense'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Category Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCategories}
        onRequestClose={() => setShowCategories(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setShowCategories(false)}
        >
          <View style={styles.categoryModal}>
            <Pressable style={styles.categoryContent} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.modalTitle}>Select Category</Text>
              
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryItem,
                    category === cat && styles.selectedCategory,
                  ]}
                  onPress={() => {
                    setCategory(cat);
                    setShowCategories(false);
                  }}
                >
                  <Text
                    style={[
                      styles.categoryItemText,
                      category === cat && styles.selectedCategoryText,
                    ]}
                  >
                    {cat}
                  </Text>
                  {category === cat && (
                    <Icon name="check" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '85%',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    overflow: 'hidden',
  },
  categoryWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  currencyText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 12,
  },
  categoryText: {
    flex: 1,
    color: COLORS.white,
    fontSize: 16,
    marginLeft: 12,
  },
  input: {
    flex: 1,
    height: 50,
    color: COLORS.white,
    fontSize: 16,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555',
  },
  cancelButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  addButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  categoryModal: {
    width: '85%',
    maxHeight: '60%',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  categoryContent: {
    padding: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedCategory: {
    backgroundColor: '#2A2A2A',
  },
  categoryItemText: {
    fontSize: 16,
    color: COLORS.white,
  },
  selectedCategoryText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});