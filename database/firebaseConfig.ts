import { getFirestore, collection, getDocs, doc, setDoc, where, addDoc, query } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

// Initialize Firebase app
const firebaseConfig = {
  apiKey: "AIzaSyB9fJLiTaJtZ2tn2fCGvuuKI-SXqGSiUbY",
  projectId: "expensetracker-e1",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fetch spending limit
export const fetchSpendingLimit = async () => {
  try {
    const spendingLimitsRef = collection(db, 'spendingLimits');
    const snapshot = await getDocs(spendingLimitsRef);
    const limitData = snapshot.docs.map(doc => doc.data());
    return limitData[0]?.limit || 0; // Default to 0 if no data found
  } catch (error) {
    console.error('Error fetching spending limit from Firestore:', error);
    return 0;
  }
};

// Set spending limit
export const setSpendingLimit = async (totalLimit: number, days: number, hours: number) => {
  const startDate = new Date().toISOString(); // Using ISO format for consistency
  const endDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000).toISOString();

  try {
    const spendingLimitDocRef = doc(db, 'spendingLimits', 'currentLimit');
    await setDoc(spendingLimitDocRef, {
      limit: totalLimit,
      startDate: startDate,
      endDate: endDate,
    });
    console.log('Limit set successfully in Firestore');
  } catch (error) {
    console.error('Error setting limit in Firestore:', error);
  }
};

// Fetch expenses (filtered example)
export const fetchExpenses = async () => {
  const expensesRef = collection(db, 'expenses');
  const q = query(expensesRef, where('amount', '>', 50));  // Example query filtering expenses greater than 50

  try {
    const querySnapshot = await getDocs(q);
    const expenses = querySnapshot.docs.map(doc => ({
      id: doc.id, // Fetch the Firestore document ID
      ...doc.data(), // Fetch the rest of the document data
    }));

    console.log('Fetched Expenses:', expenses);
    return expenses; // Return the list of expenses
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
};

// Add expense
export const addExpense = async (amount: number, category: string) => {
  try {
    const docRef = await addDoc(collection(db, 'expenses'), {
      amount: amount,
      category: category,
      date: new Date().toISOString(), // Use ISO format for consistency
      source: 'OCR Receipt', // Assuming source is always 'OCR Receipt'
    });
    console.log('Document written with ID: ', docRef.id);
  } catch (e) {
    console.error('Error adding expense: ', e);
  }
};
