import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { Expense } from '../../database/expense';
import CategoryItem from './categoryitem'; // Assuming you have a CategoryItem component

interface CategoryListContainerProps {
  groupedExpenses: { [key: string]: Expense[] }; // Grouped expenses by category
  categories: any[];
}

const CategoryListContainer: React.FC<CategoryListContainerProps> = ({ groupedExpenses }) => {
  return (
    <View style={styles.container}>
      {Object.keys(groupedExpenses).map((category) => (
        <View key={category} style={styles.categoryContainer}>
          <Text style={styles.categoryTitle}>{category}</Text>
          <FlatList
            data={groupedExpenses[category]} // Get expenses for each category
            keyExtractor={(item: any) => item.id.toString()}
            renderItem={({ item }) => <CategoryItem category={item} />}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CategoryListContainer;
