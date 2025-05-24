import React from 'react';
import { Text, Platform, TouchableOpacity, View, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../../theme';

type Props = {
  selectedDate: Date;
  onChangeDate: (date: Date) => void;
  showDatePicker: boolean;
  setShowDatePicker: (val: boolean) => void;
};

const DatePickerHeader: React.FC<Props> = ({
  selectedDate,
  onChangeDate,
  showDatePicker,
  setShowDatePicker,
}) => {
  const onChange = (_event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      onChangeDate(date);
    }
  };

  return (
    <View style={styles.dateinfoContainer}>
      <Text style={styles.selectText}>Select Date:</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        
        <Text style={styles.selectText2}>📅</Text>
      </TouchableOpacity>
      <Text style={styles.dateText}>{selectedDate.toDateString()}</Text>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  selectText: {
    fontSize: 16,
    color: '#007AFF',
  },
  selectText2: {
    fontSize: 20, 
    marginLeft: 100,
    marginTop: -25,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    marginTop: 4,
  },

  dateinfoContainer: {
    marginTop: 5,
    marginHorizontal: 8,
    marginBottom: 16,
    padding: 15,
    backgroundColor: COLORS.white || 'rgba(138, 79, 255, 0.61)',
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },

  
});

export default DatePickerHeader;
