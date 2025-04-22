import { useState, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import { Expense } from '../../database/expense'; // Assuming Expense type is defined in your app
import { Category } from './category'; // Assuming Category type is defined in your app

// Define category metadata with icons and colors
const categoryMeta: Record<string, { icon: string; color: string }> = {
  Groceries: { icon: 'cart', color: '#4CAF50' },
  Taxi: { icon: 'taxi', color: '#F44336' },
  Entertainment: { icon: 'gamepad', color: '#FFEB3B' },
  // Add other categories as needed
};

// Helper function to fetch the current spending period
export const getCurrentSpendingLimitPeriod = async () => {
  try {
    const snapshot = await firestore().collection('spendingLimits').doc('currentLimit').get();

    if (!snapshot.exists) {
      console.error('Current spending period not found!');
      return null;
    }

    const data = snapshot.data();
    if (data) {
      const { startDate, endDate, limit } = data;
      return {
        startDate: startDate.toDate(), // Convert Firestore Timestamp to JavaScript Date
        endDate: endDate.toDate(),
        limit,
      };
    }
  } catch (error) {
    console.error('Error fetching current spending period:', error);
    return null;
  }
};

// Function to fetch expenses and group them by category
export const getGroupedExpensesByCategory = async (): Promise<Category[]> => {
  const currentPeriod = await getCurrentSpendingLimitPeriod();

  if (!currentPeriod) {
    console.warn('No current spending limit period found.');
    return [];
  }

  const { startDate, endDate, limit } = currentPeriod;

  try {
    // Fetch expenses from Firestore within the current period
    const expenseSnapshot = await firestore()
      .collection('expenses')
      .where('date', '>=', firestore.Timestamp.fromDate(startDate))
      .where('date', '<=', firestore.Timestamp.fromDate(endDate))
      .get();

    // If no expenses are found, return an empty array
    if (expenseSnapshot.empty) {
      console.log('No expenses found for the current period');
      return [];
    }

    // Group expenses by category
    const groupedByCategory: { [key: string]: number } = {};

    expenseSnapshot.docs.forEach((doc) => {
      const expenseData = doc.data() as Expense; // Cast to the Expense type

      if (expenseData.category) {
        groupedByCategory[expenseData.category] =
          (groupedByCategory[expenseData.category] || 0) + expenseData.amount;
      }
    });

    // Create category list from grouped expenses
    const categories: Category[] = Object.keys(groupedByCategory).map((categoryName) => ({
      id: categoryName, // The category ID is its name
      name: categoryName, // The category name (Groceries, Taxi, etc.)
      spent: groupedByCategory[categoryName], // Total amount spent in this category
      limit, // Use the global limit from the current period
      icon: categoryMeta[categoryName]?.icon || 'cash', // Icon from metadata, default is 'cash'
      color: categoryMeta[categoryName]?.color || '#000000', // Color from metadata, default is black
    }));

    return categories;
  } catch (error) {
    console.error('Error grouping expenses by category:', error);
    return [];
  }
};
