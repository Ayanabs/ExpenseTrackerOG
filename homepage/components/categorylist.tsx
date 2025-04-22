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
      {/* Render all categories in a single FlatList container */}
      <FlatList
        data={categories} // Categories data passed from the parent component
        keyExtractor={(item) => item.id.toString()} // Use 'id' for each category item
        renderItem={({ item }) => <CategoryItem category={item} />} // Pass each category to CategoryItem for rendering
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,  // Adjust padding as needed
  },
});

export default CategoryListContainer;
