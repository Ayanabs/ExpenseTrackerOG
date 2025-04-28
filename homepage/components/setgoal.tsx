import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme';

export default function AddLimitModal({ onLimitSet }: { onLimitSet: (data: { limit: number; days: number; hours: number }) => void }) {
  const [totalLimit, setTotalLimit] = useState<number>(0);
  const [days, setDays] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const handleSetLimitClick = async () => {
    onLimitSet({ limit: totalLimit, days, hours });
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.goalButton} 
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.goalButtonText}>SET LIMIT</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalView}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.modalTitle}>Set Spending Goal</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Total Budget (Rs)</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="currency-inr" size={20} color={COLORS.primary} style={styles.inputIcon}/>
                  <TextInput
                    style={styles.input}
                    placeholder="10000"
                    keyboardType="numeric"
                    value={totalLimit > 0 ? totalLimit.toString() : ''}
                    onChangeText={(text) => setTotalLimit(Number(text) || 0)}
                    placeholderTextColor="#9e9e9e"
                  />
                </View>
              </View>
              
              <View style={styles.timeInputsContainer}>
                <View style={styles.timeInputGroup}>
                  <Text style={styles.inputLabel}>Days</Text>
                  <View style={styles.inputWrapper}>
                    <Icon name="calendar-range" size={20} color={COLORS.primary} style={styles.inputIcon}/>
                    <TextInput
                      style={styles.input}
                      placeholder="7"
                      keyboardType="numeric"
                      value={days > 0 ? days.toString() : ''}
                      onChangeText={(text) => setDays(Number(text) || 0)}
                      placeholderTextColor="#9e9e9e"
                    />
                  </View>
                </View>
                
                <View style={styles.timeInputGroup}>
                  <Text style={styles.inputLabel}>Hours</Text>
                  <View style={styles.inputWrapper}>
                    <Icon name="clock-outline" size={20} color={COLORS.primary} style={styles.inputIcon}/>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      keyboardType="numeric"
                      value={hours > 0 ? hours.toString() : ''}
                      onChangeText={(text) => setHours(Number(text) || 0)}
                      placeholderTextColor="#9e9e9e"
                    />
                  </View>
                </View>
              </View>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.setButton} 
                  onPress={handleSetLimitClick}
                  activeOpacity={0.8}
                >
                  <Text style={styles.setButtonText}>Set Goal</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  goalButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  goalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
    textAlign: 'center',
  },
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
  timeInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeInputGroup: {
    width: '48%',
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
  inputIcon: {
    paddingHorizontal: 12,
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
  setButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  setButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  }
});