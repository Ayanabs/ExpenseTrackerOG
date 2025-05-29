import { auth, firestore } from '../database/firebaseinit';

// Calculate total expenses within a time period
export const calculateTotalExpenses = async (startDate: string, endDate: string) => {
  try {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      return 0;
    }

    const expensesRef = firestore().collection('expenses');
    const querySnapshot = await expensesRef
      .where('userId', '==', currentUser.uid)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .get();

    let totalAmount = 0;
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      totalAmount += parseFloat(data.amount) || 0;
    });

    return totalAmount;
  } catch (error) {
    console.error('Error calculating total expenses:', error);
    return 0;
  }
};

// Check spending limit and return status
export const checkSpendingLimit = async () => {
  try {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      return null;
    }

    const limitDocRef = firestore().doc(`spendingLimits/${currentUser.uid}`);
    const snapshot = await limitDocRef.get();

    if (!snapshot.exists) {
      return null;
    }

    const limitData = snapshot.data() || {};
    const { limit, startDate, endDate } = limitData as { limit: number, startDate: string, endDate: string };

    const totalExpenses = await calculateTotalExpenses(startDate, endDate);
    const limitPercentage = (totalExpenses / limit) * 100;

    let status = null;
    if (limitPercentage >= 100) {
      status = 'exceeded';
    } else if (limitPercentage >= 80) {
      status = 'approaching';
    }

    if (status) {
      return {
        status,
        spent: totalExpenses,
        limit,
        percentage: limitPercentage,
        startDate,
        endDate
      };
    }

    return null;
  } catch (error) {
    console.error('Error checking spending limit:', error);
    return null;
  }
};