import React from 'react'; 
import { View, Dimensions } from 'react-native'; 
import { LineChart } from 'react-native-chart-kit'; 
 

const screenWidth = Dimensions.get('window').width; 
 

const IncomeOutcomeChart = () => { 
  return ( 
    <LineChart 
      data={{ 
        labels: ['1', '2', '3', '4', '5', '6'], 
        datasets: [ 
          { data: [12000, 14000, 11000, 16000, 20000, 22600], color: () => '#5CB85C' }, 
          { data: [15000, 17000, 19000, 18000, 21000, 23500], color: () => '#D9534F' }, 
          { data: [10000, 12000, 15000, 13000, 17000, 19100], color: () => '#5BC0DE' }, 
        ], 
        legend: ['Income', 'Outcome', 'Savings'], 
      }} 
      width={screenWidth - 32} 
      height={220} 
      chartConfig={{ 
        backgroundGradientFrom: '#fff', 
        backgroundGradientTo: '#fff', 
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, 
      }} 
      style={{ 
        borderRadius: 16, 
        marginHorizontal: 16, 
      }} 
    /> 
  ); 
}; 
 

export default IncomeOutcomeChart; 
 

 
