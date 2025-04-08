// category.tsx

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import CategoryItem from './categoryitem';
import { COLORS } from '../../theme';
import { Icon } from 'react-native-vector-icons/Icon';

// 1. Interface definition
export interface Category {
  id: string;           // Unique identifier for the category
  name: string;         // Display name (e.g., "Groceries")
  icon: string;         // Icon name from MaterialCommunityIcons
  color: string;        // Hex color code (e.g., "#4CAF50")
  limit: number;        // Budget limit
  spent: number;        // Amount spent so far
}

// 2. Category list component
