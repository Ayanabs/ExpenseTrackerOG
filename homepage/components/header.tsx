import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  SafeAreaView,
  StatusBar,
  Platform,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  // Create refs for the animation values
  const animation = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Toggle menu state and animate
  const toggleMenu = () => {
    setMenuOpen((prevState) => !prevState);
  };

  useEffect(() => {
    // Animate dropdown and icon on menu toggle
    const dropdownAnimation = Animated.timing(animation, {
      toValue: menuOpen ? 1 : 0, // Slide in/out and fade in/out
      duration: 300,
      useNativeDriver: true,
    });

    const iconRotationAnimation = Animated.timing(rotateAnim, {
      toValue: menuOpen ? 1 : 0, // Rotate icon on open/close
      duration: 300,
      useNativeDriver: true,
    });

    Animated.parallel([dropdownAnimation, iconRotationAnimation]).start();
  }, [menuOpen]);

  // Interpolation for the dropdown menu (fade in and slide up)
  const menuTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0], // Slide up when menu opens
  });

  const menuOpacity = animation;

  // Interpolation for icon rotation (rotate by 90 degrees)
  const rotateIcon = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'], // Rotate icon by 90 degrees
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Customize StatusBar */}
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <View style={[styles.header, { paddingTop: statusBarHeight }]}>
        <TouchableOpacity style={styles.iconButton} onPress={toggleMenu}>
          <Animated.View style={{ transform: [{ rotate: rotateIcon }] }}>
            <Icon name="apps" size={20} color={COLORS.black} />
          </Animated.View>
        </TouchableOpacity>

        <View style={styles.spacer} />

        <View style={styles.rightIconContainer}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="cog" size={25} color={COLORS.black} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="account-circle" size={25} color={COLORS.black} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Conditionally render dropdown menu with animation */}
      {menuOpen && (
        <Animated.View
          style={[
            styles.dropdownMenu,
            {
              transform: [{ translateY: menuTranslateY }],
              opacity: menuOpacity,
            },
          ]}
        >
          {/* Home Item */}
          <View style={[styles.menuItemContainer, { top: statusBarHeight + 20, left: -100 }]}>
            <TouchableOpacity style={styles.menuItem}>
              <Icon name="home" size={22} color={COLORS.black} />
              <Text style={styles.menuText}>Home</Text>
            </TouchableOpacity>
          </View>

          {/* About Item */}
          <View style={[styles.menuItemContainer, { top: statusBarHeight + 75, left: -160 }]}>
            <TouchableOpacity style={styles.menuItem}>
              <Icon name="information" size={22} color={COLORS.black} />
              <Text style={styles.menuText}>About</Text>
            </TouchableOpacity>
          </View>

          {/* Logout Item */}
          <View style={[styles.menuItemContainer, { top: statusBarHeight + 140, left: -170 }]}>
            <TouchableOpacity style={styles.menuItem}>
              <Icon name="logout" size={22} color={COLORS.black} />
              <Text style={styles.menuText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'transparent', // Make the background transparent
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 6, // Removed paddingTop and moved it dynamically
    backgroundColor: 'transparent', // Set header background to transparent
    position: 'relative', // Needed to make the dropdown overlay work
  },
  iconButton: {
    padding: 4,
  },
  spacer: {
    flex: 1,
  },
  rightIconContainer: {
    flexDirection: 'column',
    backgroundColor: 'rgba(66, 66, 66, 0.11)', // Optional, or you can remove this as well if not needed
    borderBottomEndRadius: 15,
    borderBottomStartRadius: 15,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownMenu: {
    position: 'absolute', // Position the dropdown absolutely
    left: '50%', // Center it horizontally
    transform: [{ translateX: -165 }], // Offset by half of the width to align the dropdown in the center
    zIndex: 1000, // Ensure the dropdown stays above other content
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  menuItemContainer: {
    position: 'absolute',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  menuText: {
    color: COLORS.black,
    fontSize: 15,
    marginLeft: 8, // Add some space between the icon and text
  },
});

export default Header;
