import React from 'react';
import { View } from 'react-native';
import TimeCircleProgress from './timeremainingprogress';

interface Props {
  remainingTime: number;
  totalDuration: number;
}

const TimeRemainingHeader: React.FC<Props> = ({ remainingTime, totalDuration }) => {
  const percentage = totalDuration > 0 ? (remainingTime / totalDuration) * 100 : 0;

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  return (
    <View>
      <TimeCircleProgress percentage={percentage} timeLabel={formatTime(remainingTime)} />
    </View>
  );
};

export default TimeRemainingHeader;
