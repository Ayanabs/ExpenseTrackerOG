import React, { useState, useEffect } from 'react'; 
import CategoryListContainer from "../../homepage/components/categorylist";
import { getGroupedExpensesByCategory } from '../../homepage/components/categorygroupexpense'; // Assuming you have this function
import { View } from 'react-native';

const ParentComponent = () => {
  const [categories, setCategories] = useState<any[]>([]); // State to hold categories

  useEffect(() => {
    const loadCategories = async () => {
      const fetchedCategories = await getGroupedExpensesByCategory(); // Fetch categories from your function
      setCategories(fetchedCategories); // Set the categories state
    };

    loadCategories();
  }, []); // Empty dependency array ensures this runs once when the component is mounted

  return (
    <View>
      {/* Pass the categories state to CategoryListContainer */}
      <CategoryListContainer categories={categories} />
    </View>
  );
};

export default ParentComponent;
