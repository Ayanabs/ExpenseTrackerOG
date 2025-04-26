import { auth, firestore } from '../database/firebaseinit';

// Fetch spending limit for the current user
export const fetchSpendingLimit = async () => {
  try {
    const currentUser = auth().currentUser;

    if (!currentUser) {
      console.log('No authenticated user found, using default spending limit');
      // Return default limit for non-authenticated users
      return 0;
    }

    const spendingLimitRef = firestore().doc(`spendingLimits/${currentUser.uid}`);
    const snapshot = await spendingLimitRef.get();

    if (snapshot.exists) {
      const limitData = snapshot.data();
      return limitData?.limit || 0;
    } else {
      console.log('No spending limit found for this user');
      return 0;
    }
  } catch (error) {
    console.error('Error fetching spending limit from Firestore:', error);
    return 0;
  }
};

// Set spending limit for the current user
export const setSpendingLimit = async (totalLimit: number, days: number, hours: number) => {
  const startDate = new Date().toISOString();
  const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000).toISOString();

  try {
    const currentUser = auth().currentUser;

    if (!currentUser) {
      console.error('Cannot set limit: No authenticated user found');
      return false;
    }

    const spendingLimitDocRef = firestore().doc(`spendingLimits/${currentUser.uid}`);
    await spendingLimitDocRef.set({
      limit: totalLimit,
      startDate: startDate,
      endDate: endDate,
      userId: currentUser.uid, // Explicitly store the userId for extra security
    });

    console.log('Limit set successfully in Firestore for user:', currentUser.uid);
    return true;
  } catch (error) {
    console.error('Error setting limit in Firestore:', error);
    return false;
  }
};

// Fetch expenses (filtered by userId)
export const fetchExpenses = async () => {
  try {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      console.error('No authenticated user found.');
      return [];  // Return an empty array if no user is authenticated
    }
    
    const expensesRef = firestore().collection('expenses');
    const querySnapshot = await expensesRef.where('userId', '==', currentUser.uid).get();
    
    const expenses = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log('Fetched Expenses:', expenses);
    return expenses;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];  // Return an empty array if there is an error
  }
};

// Add expense
export const addExpense = async (amount: number, category: string) => {
  try {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      console.error('No authenticated user found.');
      return;  // Don't proceed if no user is authenticated
    }

    const docRef = await firestore().collection('expenses').add({
      amount: amount,
      category: category,
      date: new Date().toISOString(),  // Use ISO format for consistency
      source: 'OCR Receipt',  // Assuming source is always 'OCR Receipt'
      userId: currentUser.uid,  // Associate expense with authenticated user
    });
    console.log('Document written with ID: ', docRef.id);
    return docRef.id;
  } catch (e) {
    console.error('Error adding expense: ', e);
    return null;
  }
};