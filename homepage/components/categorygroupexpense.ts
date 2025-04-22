import { useRealm } from '@realm/react';
import { Expense } from '../../database/expenses';
import { Category } from './category';
import { getCurrentSpendingLimitPeriod } from '../../database/realmHelpers'; // adjust the path if needed

// Define category metadata
const categoryMeta: Record<string, { icon: string; color: string }> = {
  Groceries: { icon: 'cart', color: '#4CAF50' },
  Taxi: { icon: 'taxi', color: '#F44336' },
  Entertainment: { icon: 'gamepad', color: '#FFEB3B' },
  // Add other categories as needed
};

export const getGroupedExpensesByCategory = async (): Promise<Category[]> => {
  const realm = useRealm();

  // Await the result of getCurrentSpendingLimitPeriod
  const currentPeriod = await getCurrentSpendingLimitPeriod(realm);

  if (!currentPeriod) {
    console.warn('No current spending limit period found.');
    return [];
  }

  const { startDate, endDate, limit } = currentPeriod; // Now currentPeriod is resolved

  // Filter expenses based on the current period's start and end date
  const expensesInRange = realm.objects<Expense>('Expense').filtered(
    'date >= $0 AND date <= $1',
    startDate,
    endDate
  );

  // Group expenses by category
  const groupedByCategory: { [key: string]: number } = {};

  expensesInRange.forEach((expense: Expense) => {
    if (expense.category) {
      groupedByCategory[expense.category] =
        (groupedByCategory[expense.category] || 0) + expense.amount;
    }
  });

  // Create category list using grouped expenses
  const categories: Category[] = Object.keys(groupedByCategory).map((name) => ({
    name,
    spent: groupedByCategory[name],
    limit, // Use the global limit from the current period
    icon: categoryMeta[name]?.icon || 'cash',
    color: categoryMeta[name]?.color || '#000000', // Default color if not found
    id: name,
  }));

  return categories;
};
