import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types'; // adjust path

const TABS = [
  { key: 'analytics', icon: 'chart-line' },
  { key: 'month', icon: 'calendar' },
  { key: 'add', icon: 'plus-circle' },
  { key: 'alerts', icon: 'bell' },
  { key: 'profile', icon: 'account' },
];

interface BottomTabsProps {
  onAddPress: () => void;
}

const BottomTabs: React.FC<BottomTabsProps> = ({ onAddPress }) => {
  const [activeTab, setActiveTab] = useState('null');
  const [showOptions, setShowOptions] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <>
      {/* Show camera and gallery options if showOptions is true */}
      {showOptions && (
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionButton}>
            <Text style={styles.optionText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              onAddPress();
              setShowOptions(false);
            }}
          >
            <Text style={styles.optionText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Tabs */}
      <View style={styles.container}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tab}
              onPress={() => {
                if (tab.key === 'add') {
                  setShowOptions(!showOptions);
                  setActiveTab(tab.key);
                } else {
                  setShowOptions(false);
                  setActiveTab(tab.key);
                  if (tab.key === 'analytics') navigation.navigate('Analytics');
                  if (tab.key === 'profile') navigation.navigate('Settings');
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
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.card,
    paddingVertical: 10,
    borderTopWidth: 0.1,
    borderLeftWidth: 0.1,
    borderRightWidth: 0.1,
    
   
    
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 5, // Make sure it's on top
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
    bottom: 70,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10, // Ensure it's on top
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  optionText: {
    color: 'white',
    fontSize: 16,
  },
});

export default BottomTabs;
