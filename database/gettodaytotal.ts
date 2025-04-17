// getTodayTotal.ts
import Realm from 'realm';
import { Expense } from '../database/expenses';
import { useRealm } from '@realm/react';

export const getTodayTotal = async (): Promise<number> => {
  try {
    const realm = useRealm(); // Use the realm instance from your context or provider

    const today = new Date().toISOString().split('T')[0];

    const expenses = realm
      .objects<Expense>('Expense')
      .filtered('date >= $0 && date < $1', new Date(today), new Date(new Date(today).getTime() + 86400000));

    const dbtotal = expenses.reduce((sum: number, exp: Expense) => sum + exp.amount, 0);

    realm.close();
    return dbtotal;
  } catch (error) {
    console.error('Error fetching today’s expenses:', error);
    return 0;
  }
};
