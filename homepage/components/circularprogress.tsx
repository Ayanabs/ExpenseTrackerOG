import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import { COLORS } from '../../theme';

// Create an animated Circle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  percentage: number;
  totalSpent?: number;
  label?: string;
}

const CircleProgress: React.FC<Props> = ({ percentage, totalSpent, label }) => {
  const radius = 100;
  const strokeWidth = 40;
  const innerStrokeWidth = 30;
  const decorativeStrokeWidth = 10;

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
      useNativeDriver: false, // required for SVG animations
    }).start();
  }, [percentage]);

  return (
    <View style={styles.container}>
      <Svg height="250" width="250" viewBox="0 0 250 250">
        {/* Background Ring */}
        <Circle
          cx="125"
          cy="125"
          r={radius - decorativeStrokeWidth / 4}
          stroke="#6434c2"
          strokeWidth={innerStrokeWidth}
          fill="transparent"
        />

        {/* Decorative Inner Ring */}
        <Circle
          cx="125"
          cy="125"
          r={radius - decorativeStrokeWidth / 0.8}
          stroke="#47248c"
          strokeWidth={decorativeStrokeWidth}
          fill="transparent"
        />

        {/* Animated Foreground Progress Ring */}
        <AnimatedCircle
          cx="125"
          cy="125"
          r={radius - strokeWidth / 40}
          stroke="rgba(138, 79, 255, 0.61)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={animatedStrokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90, 125, 125)"
        />
      </Svg>

      {/* Center Text */}
      <View style={styles.centerText}>
        <Text style={styles.percentage}>{percentage}%</Text>
        {totalSpent !== undefined ? (
          <Text style={styles.amount}>Rs.{totalSpent} spent</Text>
        ) : label ? (
          <Text style={styles.amount}>{label}</Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: -5,
    marginRight: -80,
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  amount: {
    fontSize: 16,
    color: COLORS.primary,
  },
});

export default CircleProgress;
