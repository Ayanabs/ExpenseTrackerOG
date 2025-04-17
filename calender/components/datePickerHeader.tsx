import React from 'react';
import { Text, Platform, TouchableOpacity, View, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

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
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <Text style={styles.selectText}>📅 Select Date:</Text>
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
  dateText: {
    fontSize: 16,
    color: '#333',
    marginTop: 4,
  },
});

export default DatePickerHeader;
