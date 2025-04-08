import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Button, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme';

interface AddLimitModalProps {
  onLimitSet: (limit: number, time: string) => void;
}

const AddLimitModal: React.FC<AddLimitModalProps> = ({ onLimitSet }) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [limit, setLimit] = useState<string>('');
  const [time, setTime] = useState<string>('');

  const handleSubmit = () => {
    const parsedLimit = parseFloat(limit);
    if (!isNaN(parsedLimit) && parsedLimit > 0 && time) {
      onLimitSet(parsedLimit, time);
      setModalVisible(false);
      setLimit('');
      setTime('');
    } else {
      alert('Please enter valid values for both limit and time');
    }
  };

  return (
    <>
      {/* Set Goal Button */}
      <TouchableOpacity style={styles.setGoalButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.setGoalButtonText}>Set Goal</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Set Your Spending Limit and Time</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter spending limit"
              keyboardType="numeric"
              value={limit}
              onChangeText={setLimit}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter time (e.g., 7 days)"
              value={time}
              onChangeText={setTime}
            />

            <Button title="Set Limit and Time" onPress={handleSubmit} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} color={COLORS.danger} />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  setGoalButton: {
    backgroundColor: COLORS.yellow,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginLeft: 80,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  setGoalButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#D3D3D3',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#F9F9F9',
    marginBottom: 20,
  },
});

export default AddLimitModal;
function alert(arg0: string) {
  throw new Error('Function not implemented.');
}

