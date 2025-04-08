// CategoryItem.tsx 
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme';
import { Category } from './category';



const CategoryItem: React.FC<{ category: Category }> = ({ category }) => {
  const percentage = (category.spent / category.limit) * 100;
  const left = category.limit - category.spent;
  const isExceeded = left < 0;


  return (

    <View style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.iconWrapper, { backgroundColor: category.color + '20' }]}>
          <Icon name={category.icon} size={24} color={category.color} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{category.name}</Text>
          <Text style={styles.spent}>Rs.{category.spent} of Rs.{category.limit}</Text>
        </View>
      </View>
      <View style={styles.rightSide}>
        {isExceeded ? (
          <Text style={styles.over}>Limit is exceeded - Rs.{Math.abs(left)}</Text>
        ) : (
          <Text style={styles.left}>Left: Rs.{left}</Text>
        )}
        <View style={styles.barBackground}>
          <View
            style={{
              width: `${Math.min(percentage, 100)}%`,
              height: 6,
              borderRadius: 4,
              backgroundColor: isExceeded ? COLORS.danger : category.color,
            }}
          />
        </View>
      </View>
    </View>

  );

};
const styles = StyleSheet.create({

  card: {

    backgroundColor: COLORS.card,

    borderRadius: 12,

    padding: 16,

    marginBottom: 12,

  },

  row: {

    flexDirection: 'row',

    alignItems: 'center',

  },

  iconWrapper: {

    width: 40,

    height: 40,

    borderRadius: 20,

    justifyContent: 'center',

    alignItems: 'center',

    marginRight: 12,

  },

  info: {

    justifyContent: 'center',

  },

  name: {

    fontSize: 16,

    fontWeight: 'bold',

    color: COLORS.white,

  },

  spent: {

    fontSize: 13,

    color: COLORS.gray,

  },

  rightSide: {

    marginTop: 10,

  },

  left: {

    color: COLORS.success,

    marginBottom: 6,

  },

  over: {

    color: COLORS.danger,

    marginBottom: 6,

  },

  barBackground: {

    width: '100%',

    height: 6,

    backgroundColor: '#333333',

    borderRadius: 4,

  },

});



export default CategoryItem; 