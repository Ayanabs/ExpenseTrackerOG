import { auth, firestore } from '../database/firebaseinit';
import { checkSpendingLimit } from './spendingalerts';
import { sendLocalNotification } from './notificationservice';

export const initializeSpendingAlertService = () => {
  // Listen for expense changes to trigger limit checks
  const unsubscribeExpenses = firestore()
    .collection('expenses')
    .where('userId', '==', auth().currentUser?.uid)
    .onSnapshot(async snapshot => {
      // Only run check if documents were added or modified
      if (snapshot.docChanges().some(change => 
        change.type === 'added' || change.type === 'modified')) {
        await checkAndNotify();
      }
    }, error => {
      console.error('Error listening to expenses:', error);
    });

  return unsubscribeExpenses;
};

export const checkAndNotify = async () => {
  try {
    const alertData = await checkSpendingLimit();
    
    if (alertData) {
      const { status, spent, limit, percentage } = alertData;
      
      if (status === 'exceeded') {
        await sendLocalNotification(
          'Spending Limit Exceeded!',
          `You've spent ${spent.toFixed(2)}, which exceeds your limit of ${limit.toFixed(2)}.`,
          { alertType: 'exceeded' }
        );
      } else if (status === 'approaching') {
        await sendLocalNotification(
          'Approaching Spending Limit',
          `You've spent ${spent.toFixed(2)}, which is ${percentage.toFixed(0)}% of your ${limit.toFixed(2)} limit.`,
          { alertType: 'approaching' }
        );
      }
    }
  } catch (error) {
    console.error('Error in checkAndNotify:', error);
  }
};