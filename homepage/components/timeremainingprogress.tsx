import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import { COLORS } from '../../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  percentage: number;
  totalSpent?: number;
  timeLabel?: string;
}

const TimeCircleProgress: React.FC<Props> = ({ percentage, totalSpent, timeLabel }) => {
  const radius = 40;
  const strokeWidth = 10;
  const size = 100;
  const circumference = 2 * Math.PI * radius;
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  const animatedStrokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });
  
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: percentage,
      duration: 1000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [percentage]);
  
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
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.primary}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={animatedStrokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </Svg>
      
      <View style={styles.centerText}>
        <Text style={styles.percentage}>{percentage.toFixed(0)}%</Text>
        {totalSpent !== undefined ? (
          <Text style={styles.amount}>Rs.{totalSpent} spent</Text>
        ) : timeLabel ? (
          <Text style={styles.amount}>{timeLabel}</Text>
        ) : null}
      </View>
      
      <Text style={styles.timeRemainingText}>Time Remaining</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -60,
    marginLeft: 10,
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: -15,
    left: 0,
    right: 0,
    bottom: 0,
  },
  percentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  amount: {
    fontSize: 8,
    color: COLORS.primary,
    textAlign: 'center',
  },
  timeRemainingText: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 0,
    fontWeight: '500',
  },
});

export default TimeCircleProgress;