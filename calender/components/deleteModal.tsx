import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';

type Props = {
  expenseId: string; 
  onCancel: () => void;
  onDelete: () => void; 
};

const DeleteModal: React.FC<Props> = ({ expenseId, onCancel, onDelete }) => {
  // Handle delete action
  const handleDelete = async () => {
    if (!expenseId) {
      console.error('Expense ID is missing');
      return; 
    }

    try {
      await firestore().collection('expenses').doc(expenseId).delete(); // Delete the document from Firestore
      console.log('Expense deleted successfully');
      onDelete(); 
    } catch (error) {
      console.error('Error deleting expense: ', error);
    }
  };

  return (
    <Modal transparent animationType="fade" visible={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Delete Expense</Text>
          <Text style={styles.message}>Are you sure you want to delete this expense?</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleDelete}>
              <Text style={styles.confirmText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#d32f2f',
  },
  message: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    marginRight: 12,
  },
  cancelText: {
    color: '#555',
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default DeleteModal;
