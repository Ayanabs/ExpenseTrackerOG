import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import { COLORS } from '../../theme';

interface Props {
  percentage: number;
  totalSpent?: number; // optional
  label?: string; // new optional prop
}

const CircleProgress: React.FC<Props> = ({ percentage, totalSpent, label }) => {
  const radius = 100; // Increased the radius to make the circle bigger
  const strokeWidth = 40; // Adjusted stroke width accordingly
  const strokeWidth3 = 30; // Adjusted stroke width accordingly
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;
  const radius2= 100;
  const strokeWidth2 = 10; // Adjusted stroke width accordingly
  const circumference2 = 2 * Math.PI * radius2;
  const strokeDashoffset2 = circumference2 - circumference2 ;

  return (
    <View style={styles.container}>
      <Svg height="250" width="250" viewBox="0 0 250 250"> {/* Increased height and width */}
     
        <Circle
          cx="125"
          cy="125"
          r={radius-strokeWidth2 / 4}
          stroke="#6434c2"
          strokeWidth={strokeWidth3}
          fill="transparent"
        />
       <Circle
          cx="125"
          cy="125"
          r={radius2 - strokeWidth2 / 0.8} // Adjusted radius for inner circle
          stroke="#47248c" // dark color for the inner circle
          strokeWidth={strokeWidth2}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset2}
          strokeLinecap="round"
          
        />
       
          <Circle
          cx="125"
          cy="125"
          r={radius - strokeWidth / 40} // Adjusted radius for outer circle
          stroke="rgba(138, 79, 255, 0.61)" // Light gray color for the inner circle

          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90, 125, 125)"
        />
        
      </Svg>
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
    alignItems: 'center', // Move the circle to the right
    justifyContent: 'center',
    marginVertical: -5,
    marginRight: -80, // Additional margin to move it further right
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    fontSize: 36, // Increased font size to match bigger circle
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  amount: {
    fontSize: 16, // Increased font size for better visibility
    color: COLORS.primary,
  },
});

export default CircleProgress;
