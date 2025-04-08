import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types'; // adjust path
import { color } from '@rneui/base';

// Define the TABS as constants
const TABS = [
  { key: 'analytics', icon: 'chart-line' },
  { key: 'month', icon: 'calendar' },
  { key: 'add', icon: 'plus-circle' },
  { key: 'alerts', icon: 'bell' },
  { key: 'profile', icon: 'account' },
];

interface BottomTabsProps {
  onAddPress: () => void; // Function to handle the 'Add' tab press
}

const BottomTabs: React.FC<BottomTabsProps> = ({ onAddPress }) => {
  const [activeTab, setActiveTab] = useState('null');
  const [showOptions, setShowOptions] = useState(false); // To show/hide options
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();


  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = tab.key === activeTab;

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => {
              if (tab.key === 'add') {
                setShowOptions(!showOptions); // Toggle options visibility when 'add' tab is pressed
                 setActiveTab(tab.key); 
              } else {
                setActiveTab(tab.key); // Change active tab for other tabs
              }
              if (tab.key === 'analytics') {
                navigation.navigate('Analytics'); // Navigate to AnalyticsScreen
              }
              if (tab.key === 'profile') {
                navigation.navigate('Settings'); // Navigate to SettingsScreen
              }
            }}
          >
            <Icon
              name={tab.icon}
              size={24}
              color={isActive ? COLORS.primary : COLORS.tabInactive}
            />
            <Text
              style={[
                styles.label,
                { color: isActive ? COLORS.primary : COLORS.tabInactive },
              ]}
            >
              {tab.key.toUpperCase()}
            </Text>
          </TouchableOpacity>
        );
      })}

      {/* Show camera and gallery options if showOptions is true */}
      {showOptions && (
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionButton}>
            <Text style={styles.optionText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              onAddPress(); // Call onAddPress when "Choose from Gallery" is pressed
              setShowOptions(false); // Hide the options after choosing
            }}
          >
            <Text style={styles.optionText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.card,
    paddingVertical: 10,
    
    borderTopColor: '#2C2C2C',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },
  tab: {
    
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    marginTop: 4,
    
  },
  optionsContainer: {
    position: 'absolute',
    bottom: 70, // Adjust the position above the tabs
    left: 0,
    right: 0,
    backgroundColor: 'white',
    
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row', // Align buttons side by side
    justifyContent: 'space-around', // Space out the buttons
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
    marginHorizontal: 10, // Add space between buttons
  },
  optionText: {
    color: 'white',
    fontSize: 16,
  },
});

export default BottomTabs;
