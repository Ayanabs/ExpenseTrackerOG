import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme';
import TimeCircleProgress from './timeremainingprogress'; // Adjust path if needed

const TimeRemainingHeader = () => {
  const timeRemainingPercentage = 40;
  const timeLabel = '5h 20m';

  return (
    <View style={styles.container}>
      <TimeCircleProgress percentage={timeRemainingPercentage} timeLabel={timeLabel} />
      <Text style={styles.title}>Time Remaining</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    flexDirection: 'column',
    alignItems: 'center', // Keep progress circle centered
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.black,
    marginTop: 10,
    marginBottom: 10,
    alignSelf: 'flex-start', // Align title to the left
    width: '100%', // Ensures the title has full width to align to the left
  },
});

export default TimeRemainingHeader;
