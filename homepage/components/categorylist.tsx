import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { Category } from './category'; // Assuming Category type is defined in your app
import CategoryItem from './categoryitem'; // Assuming you have a CategoryItem component

interface CategoryListContainerProps {
  categories: Category[]; // Categories prop is expected to be an array of Category objects
}

const CategoryListContainer: React.FC<CategoryListContainerProps> = ({ categories }) => {
  return (
    <View style={styles.container}>
      {/* Loop through each category and display it */}
      <FlatList
        data={categories} // Assuming categories are passed as an array
        keyExtractor={(item: Category) => item.id.toString()} // Use 'id' for each category
        renderItem={({ item }) => <CategoryItem category={item} />} // Pass category to CategoryItem
      />
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
