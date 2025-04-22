import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

export default function AddLimitModal({ onLimitSet }: { onLimitSet: (data: { limit: number; days: number; hours: number }) => void }) {
  const [totalLimit, setTotalLimit] = useState<number>(0);
  const [days, setDays] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [showInputs, setShowInputs] = useState<boolean>(false);

  const handleSetLimitClick = async () => {
    // Call the onLimitSet function with only the new limit
    onLimitSet({ limit: totalLimit, days, hours });

    // You can handle the logic of calculating the endDate here inside Homepage.tsx
    // and update Firestore with the startDate, endDate, and totalLimit
    setShowInputs(false); // Close inputs after setting limit
  };

  return (
    <View style={styles.container}>
      <Button title="Goal" onPress={() => setShowInputs(prev => !prev)} />
      {showInputs && (
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            placeholder="Total Limit"
            keyboardType="numeric"
            value={totalLimit.toString()}
            onChangeText={(text) => setTotalLimit(Number(text))}
          />
          <TextInput
            style={styles.input}
            placeholder="Days"
            keyboardType="numeric"
            value={days.toString()}
            onChangeText={(text) => setDays(Number(text))}
          />
          <TextInput
            style={styles.input}
            placeholder="Hours"
            keyboardType="numeric"
            value={hours.toString()}
            onChangeText={(text) => setHours(Number(text))}
          />
          <Button title="Set Limit" onPress={handleSetLimitClick} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  modalContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    borderRadius: 5,
  },
});
