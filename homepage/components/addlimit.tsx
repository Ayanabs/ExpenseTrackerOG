import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Button } from 'react-native';
import { COLORS } from '../../theme';

interface AddLimitModalProps {
  visible: boolean;
  onClose: () => void;
  onLimitSet: (limit: number, time: string) => void; // Updated to handle time as well
}

const AddLimitModal: React.FC<AddLimitModalProps> = ({ visible, onClose, onLimitSet }) => {
  const [limit, setLimit] = useState<string>(''); // Store the input value for limit
  const [time, setTime] = useState<string>(''); // Store the input value for time

  const handleLimitChange = (text: string) => {
    setLimit(text);
  };

  const handleTimeChange = (text: string) => {
    setTime(text);
  };

  const handleSubmit = () => {
    const parsedLimit = parseFloat(limit);
    if (!isNaN(parsedLimit) && parsedLimit > 0 && time) {
      onLimitSet(parsedLimit, time); // Pass both limit and time to the parent component
      onClose(); // Close the modal
    } else {
      alert('Please enter valid values for both limit and time');
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Set Your Spending Limit and Time</Text>
          
          {/* Input for spending limit */}
          <TextInput
            style={styles.input}
            placeholder="Enter spending limit"
            keyboardType="numeric"
            value={limit}
            onChangeText={handleLimitChange}
          />
          
          {/* Input for time */}
          <TextInput
            style={styles.input}
            placeholder="Enter time (e.g., 7 days, 30 days)"
            value={time}
            onChangeText={handleTimeChange}
          />
          
          <Button title="Set Limit and Time" onPress={handleSubmit} />
          <Button title="Cancel" onPress={onClose} color={COLORS.danger} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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

