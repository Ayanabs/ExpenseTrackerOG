// observeTodayTotal.ts
import Realm from 'realm';
import { Expense } from './expenses'; // Adjust path if needed
import { useRealm } from '@realm/react';

export const observeTodayTotal = async (
  onChange: (total: number) => void
): Promise<() => void> => {
  const realm = useRealm(); // Use the realm instance from your context or provider


  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  

  const todayExpenses = realm
    .objects<Expense>('Expense')
    .filtered('date >= $0 AND date <= $1', startOfDay, endOfDay);

  const computeTotal = () => {
    const total = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    onChange(total);
  };

  // Initial calculation
  computeTotal();

  // Add listener
  const listener = () => {
    computeTotal(); // update when the collection changes
  };

  todayExpenses.addListener(listener);

  // Return a cleanup function
  return () => {
    todayExpenses.removeListener(listener);
    realm.close(); // close Realm when unmounting
  };
};
