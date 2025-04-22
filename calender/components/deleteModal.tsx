import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { getFirestore, doc, deleteDoc } from 'firebase/firestore'; // Firestore imports
import { getApp } from 'firebase/app'; // Initialize app

type Props = {
  expenseId: string; // ID of the expense to be deleted
  onCancel: () => void;
  onDelete: () => void; // This will trigger the delete action from the parent component
};

const DeleteModal: React.FC<Props> = ({ expenseId, onCancel, onDelete }) => {
  const db = getFirestore(getApp()); // Get Firestore instance

  // Handle delete action
  const handleDelete = async () => {
    if (!expenseId) {
      console.error('Expense ID is missing');
      return; // Exit early if expenseId is undefined or null
    }
  
    try {
      const expenseDocRef = doc(db, 'expenses', expenseId); // Reference to Firestore document
      await deleteDoc(expenseDocRef); // Delete the document from Firestore
      console.log('Expense deleted successfully');
      onDelete(); // Notify the parent component that deletion was successful
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
