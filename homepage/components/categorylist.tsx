import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CategoryItem from './categoryitem';
import { COLORS } from '../../theme';
import { Category } from './category';

const CategoryListContainer: React.FC = () => {
  const [expanded, setExpanded] = useState(true);

  // Local categories array moved from Homepage
  const [categories] = useState<Category[]>([
    {
      name: 'Groceries',
      spent: 3500,
      limit: 5000,
      icon: 'cart',
      color: COLORS.success,
      id: '',
    },
    {
      name: 'Transport',
      spent: 2000,
      limit: 1500,
      icon: 'taxi',
      color: COLORS.danger,
      id: '',
    },
    {
      name: 'Entertainment',
      spent: 500,
      limit: 1000,
      icon: 'gamepad',
      color: COLORS.warning,
      id: '',
    },
  ]);

  return (
    <View>
      {/* Chevron Button OUTSIDE the card container */}
      <TouchableOpacity
        style={styles.chevronWrapper}
        onPress={() => setExpanded(!expanded)}
      >
        <Icon
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={30}
          color={COLORS.black}
        />
      </TouchableOpacity>

      {/* Card-style container */}
      {expanded && (
        <View style={styles.wrapper}>
          <Text style={styles.title}>Categories</Text>
          {categories.map((category, index) => (
            <CategoryItem key={index} category={category} />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chevronWrapper: {
    alignSelf: 'flex-start',
    marginLeft: 25,
    marginBottom: -7,
  },
  wrapper: {
    backgroundColor: COLORS.card,
   
    borderTopEndRadius: 35,
    borderTopStartRadius: 35,
    padding: 25,
    paddingTop: 9,
    width: '100%',
  },
  title: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});

export default CategoryListContainer;
