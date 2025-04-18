import { getCurrentSpendingLimitPeriod } from './realmHelpers';
import { Expense } from '../database/expenses'; // adjust the path to your actual Expense model
import Realm from 'realm';

export const observeSpendingLimitTotal = async (
  realm: Realm,
  setTotalSpent: (total: number) => void
): Promise<() => void> => {
  const currentPeriod = await getCurrentSpendingLimitPeriod(realm);

  if (!currentPeriod) {
    console.log("❌ No spending limit period found");
    return () => {};
  }

  // ✅ Avoid Realm object issues by copying dates
  const startDate = new Date(currentPeriod.startDate);
  const endDate = new Date(currentPeriod.endDate);

  console.log("✅ Observing expenses from", startDate, "to", endDate);

  const expenses = realm.objects<Expense>('Expense')
    .filtered('date >= $0 AND date <= $1', startDate, endDate);

  const computeTotal = () => {
    const total = expenses.sum('amount');
    console.log("🧾 Matching expenses count:", expenses.length);
    console.log("📊 Total amount calculated:", total);
    expenses.forEach(e => {
      console.log(" -", e.source, "|", e.amount, "|", e.date);
    });
    setTotalSpent(total ?? 0);
  };

  computeTotal();

  const listener = () => {
    console.log("🔄 Expense collection changed");
    computeTotal();
  };

  expenses.addListener(listener);

  return () => {
    expenses.removeListener(listener);
  };
};
