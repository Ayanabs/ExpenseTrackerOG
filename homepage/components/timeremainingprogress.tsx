import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import { COLORS } from '../../theme';

interface Props {
  percentage: number;
  totalSpent?: number;
  timeLabel?: string;
}

const TimeCircleProgress: React.FC<Props> = ({ percentage, totalSpent, timeLabel }) => {
  const radius = 40; // Increased radius for a bigger circle
  const strokeWidth = 10; // Thicker stroke for the larger circle
  const size = 100; // Increased SVG size to accommodate the larger circle
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  return (
    <View style={styles.container}>
      <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#2A2A2A"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.primary}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </Svg>
      <View style={styles.centerText}>
        <Text style={styles.percentage}>{percentage}%</Text>
        {totalSpent !== undefined ? (
          <Text style={styles.amount}>Rs.{totalSpent} spent</Text>
        ) : timeLabel ? (
          <Text style={styles.amount}>{timeLabel}</Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center', // Move the circle to the left
    justifyContent: 'center',
    marginTop: -80,
    marginLeft: -10, // Additional margin to move it further left
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    fontSize: 16, // Slightly larger font size for a bigger circle
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  amount: {
    fontSize: 12, // Larger font size
    color: COLORS.primary,
    textAlign: 'center',
  },
});

export default TimeCircleProgress;
