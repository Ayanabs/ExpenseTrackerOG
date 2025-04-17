import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { createSpendingLimitPeriod } from '../realmHelpers';
import { useRealm } from '@realm/react';

export default function AddLimitModal({ onLimitSet }: { onLimitSet: (limit: number) => void }) {
  const realm = useRealm();
  const [totalLimit, setTotalLimit] = useState<number>(0);
  const [days, setDays] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [showInputs, setShowInputs] = useState<boolean>(false);

  const handleSetLimit = () => {
    const startDate = new Date();
    const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000);
    createSpendingLimitPeriod(realm, startDate, endDate, totalLimit);
    onLimitSet(totalLimit);
    setShowInputs(false); // hide inputs after setting limit
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
          <Button title="Set Limit" onPress={handleSetLimit} />
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
