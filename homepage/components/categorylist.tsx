import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { useRealm, useQuery } from '@realm/react';
import { Expense } from '../../database/expenses';  // Adjust the import path
import { Category } from './category';  // Assuming Category type is defined elsewhere
import { getCurrentSpendingLimitPeriod } from '../realmHelpers';  // Adjust the import path

const CategoryList: React.FC = () => {
  const realm = useRealm();
  const allExpenses = useQuery(Expense);

  const [categories, setCategories] = useState<Category[]>([]);
  const [spendingLimit, setSpendingLimit] = useState<number>(0);

  // Group expenses by category
  useEffect(() => {
    const groupExpensesByCategory = () => {
      const groupedByCategory: { [key: string]: number } = {};

      // Loop through all expenses and group by category
      allExpenses.forEach((expense: Expense) => {
        if (expense.category) {
          groupedByCategory[expense.category] =
            (groupedByCategory[expense.category] || 0) + expense.amount;
        }
      });

      // Convert grouped data into category objects
      const categoryList = Object.keys(groupedByCategory).map((name, index) => ({
        id: index.toString(),  // Generate a unique id
        name,
        totalSpent: groupedByCategory[name],
        limit: 0,  // Default limit or fetch from a relevant source
        spent: groupedByCategory[name],  // Assuming totalSpent is the same as spent
        icon: 'cash',  // Use a default icon or define custom icons per category
        color: '#000000',  // Default color or define per category
      }));

      setCategories(categoryList);
    };

    groupExpensesByCategory();
  }, [allExpenses]);

  // Fetch the spending limit
  useEffect(() => {
    const fetchSpendingLimit = async () => {
      const limitPeriod = await getCurrentSpendingLimitPeriod(realm);
      if (limitPeriod) {
        setSpendingLimit(limitPeriod.limit);  // Set the spending limit
      }
    };

    fetchSpendingLimit();
  }, [realm]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Categories</Text>
      <FlatList
        data={categories}
        keyExtractor={(item: any) => item.name}  // Use name as key
        renderItem={({ item }) => (
          <View style={styles.categoryItem}>
            <Text style={[styles.categoryText, { color: item.color }]}>
              {item.name} - 💰 {item.totalSpent.toFixed(2)}
            </Text>
            {/* You can add category icons here if you'd like */}
            <Text>{item.icon}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No categories found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  categoryItem: {
    marginBottom: 15,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  empty: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default CategoryList;
