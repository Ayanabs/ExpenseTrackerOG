import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';

const TABS = [
  { key: 'analytics', icon: 'chart-line', label: 'ANALYTICS' },
  { key: 'month', icon: 'calendar', label: 'MONTH' },
  { key: 'add', icon: 'plus-circle', label: 'ADD' },
  { key: 'alerts', icon: 'bell', label: 'ALERTS' },
  { key: 'profile', icon: 'account', label: 'PROFILE' },
];

interface BottomTabsProps {
  onAddPress: () => void;
  onTakePhoto?: () => void;
}

const BottomTabs: React.FC<BottomTabsProps> = ({ onAddPress, onTakePhoto }) => {
  const [activeTab, setActiveTab] = useState<string>('null');
  const [showOptions, setShowOptions] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Handle take photo option
  const handleTakePhoto = () => {
    if (onTakePhoto) {
      onTakePhoto();
    } else {
     
      onAddPress();
    }
    setShowOptions(false);
  };

  // Handle choose from gallery option
  const handleChooseFromGallery = () => {
    onAddPress();
    setShowOptions(false);
  };

  return (
    <>
      {/* Photo options modal */}
      <Modal
        visible={showOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptions(false)}
        >
          <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={handleTakePhoto}
            >
              <Icon name="camera" size={20} color="white" />
              <Text style={styles.optionText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleChooseFromGallery}
            >
              <Icon name="image" size={20} color="white" />
              <Text style={styles.optionText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Bottom Tabs */}
      <View style={styles.container}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          const isAddTab = tab.key === 'add';

          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isAddTab && styles.addTab]}
              onPress={() => {
                if (isAddTab) {
                  setShowOptions(!showOptions);
                  setActiveTab(tab.key);
                } else {
                  setShowOptions(false);
                  setActiveTab(tab.key);
                  if (tab.key === 'analytics') navigation.navigate('Analytics');
                  if (tab.key === 'profile') navigation.navigate('Settings');
                  if (tab.key === 'month') navigation.navigate('MonthTab');
                  if (tab.key === 'alerts') navigation.navigate('Alerts');
                  
                }
              }}
            >
              <Icon
                name={tab.icon}
                size={isAddTab ? 32 : 24}
                color={isActive ? COLORS.primary : COLORS.tabInactive}
                style={isAddTab ? styles.addIcon : null}
              />
              <Text
                style={[
                  styles.label,
                  { color: isActive ? COLORS.primary : COLORS.tabInactive },
                ]}
              >
                {tab.label}
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
    paddingVertical: 7,
    borderTopWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
   
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 5,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  addTab: {
    marginTop: -30,
  },
  addIcon: {
    backgroundColor: '#47248c',
    borderRadius: 30,
    width: 60,
    height: 60,
    textAlign: 'center',
    lineHeight: 60,
    overflow: 'hidden',
    marginBottom: 2,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    paddingBottom: 100,
  },
  optionsContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginHorizontal: 15,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  optionButton: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 2,
    flex: 1,
  },
  optionText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default BottomTabs;