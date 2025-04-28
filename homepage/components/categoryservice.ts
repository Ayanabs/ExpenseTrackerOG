import firestore from '@react-native-firebase/firestore';
import { Category } from './category';
import auth from '@react-native-firebase/auth'; // Updated import

// Define category metadata with icons and colors
export const categoryMeta: Record<string, { icon: string; color: string }> = {
  Groceries: { icon: 'cart', color: '#4CAF50' },
  Taxi: { icon: 'taxi', color: '#F44336' },
  'Public transport': { icon: 'bus', color: '#2196F3' },
  Home: { icon: 'home', color: '#FF4081' },
  Entertainment: { icon: 'gamepad', color: '#FFEB3B' },
  Sport: { icon: 'basketball', color: '#FF9800' },
  SMS: { icon: 'message-text', color: '#2196F3' },
  Receipt: { icon: 'receipt', color: '#FF9800' },
  Other: { icon: 'dots-horizontal', color: '#9E9E9E' },
  Uncategorized: { icon: 'cash', color: '#9E9E9E' },
  Shopping: { icon: 'bag', color: '#9E9E9E' },
};

// Function to get the current spending period for the logged-in user
// Updated function to get the current spending period
export const getCurrentSpendingPeriod = async () => {
  try {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      console.error('No user is logged in');
      return null;
    }

    // Get the current date to find an active spending period
    const now = new Date();
    
    // Query for spending limits that include the current date
    const spendingLimitsQuery = await firestore()
      .collection('spendingLimits')
      .where('userId', '==', currentUser.uid)
      .where('startDate', '<=', firestore.Timestamp.fromDate(now))
      .where('endDate', '>=', firestore.Timestamp.fromDate(now))
      .limit(1)
      .get();

    // If no active period, try to get the most recent one
    if (spendingLimitsQuery.empty) {
      console.log('No active spending period found, trying to get most recent');
      
      const recentLimitsQuery = await firestore()
        .collection('spendingLimits')
        .where('userId', '==', currentUser.uid)
        .orderBy('startDate')
        .limit(1)
        .get();
        
      if (recentLimitsQuery.empty) {
        console.log('No spending periods found at all');
        return null;
      }
      
      const recentLimit = recentLimitsQuery.docs[0].data();
      console.log('Found recent spending period:', recentLimit);
      
      return {
        startDate: recentLimit.startDate instanceof firestore.Timestamp ? 
          recentLimit.startDate.toDate() : recentLimit.startDate,
        endDate: recentLimit.endDate instanceof firestore.Timestamp ? 
          recentLimit.endDate.toDate() : recentLimit.endDate,
        limit: recentLimit.limit || 0,
      };
    }

    // We found an active period
    const activeLimit = spendingLimitsQuery.docs[0].data();
    console.log('Found active spending period:', activeLimit);
    
    return {
      startDate: activeLimit.startDate instanceof firestore.Timestamp ? 
        activeLimit.startDate.toDate() : activeLimit.startDate,
      endDate: activeLimit.endDate instanceof firestore.Timestamp ? 
        activeLimit.endDate.toDate() : activeLimit.endDate,
      limit: activeLimit.limit || 0,
    };
  } catch (error) {
    console.error('Error fetching spending period:', error);
    return null;
  }
};
// Function to fetch categories with expenses for the current spending period
export const fetchCategoriesWithExpenses = async (): Promise<Category[]> => {
  try {
    const currentUser = auth().currentUser; // Fixed auth access
    if (!currentUser) {
      console.error('No user is logged in');
      return [];
    }

    // Get current spending period
    const period = await getCurrentSpendingPeriod();
    if (!period) {
      console.error('No active spending period found');
      return [];
    }

    console.log(`Fetching expenses for period: ${period.startDate.toISOString()} to ${period.endDate.toISOString()}`);

    // Fetch all expenses for the current period
    const expensesSnapshot = await firestore()
      .collection('expenses')
      .where('userId', '==', currentUser.uid)
      .where('date', '>=', firestore.Timestamp.fromDate(period.startDate))
      .where('date', '<=', firestore.Timestamp.fromDate(period.endDate))
      .get();

    // Process expenses and group by category
    const categoryTotals: Record<string, number> = {};
    
    expensesSnapshot.forEach(doc => {
      const expense = doc.data();
      const category = expense.category || 'Uncategorized';
      const amount = typeof expense.amount === 'number' 
        ? expense.amount 
        : parseFloat(expense.amount as unknown as string) || 0;
      
      // Add to category total
      categoryTotals[category] = (categoryTotals[category] || 0) + amount;
    });

    console.log('Category totals:', categoryTotals);

    // Get predefined category limits if they exist
    const categoryLimitsSnapshot = await firestore()
      .collection('categoryLimits')
      .where('userId', '==', currentUser.uid)
      .get();

    const categoryLimits: Record<string, number> = {};
    categoryLimitsSnapshot.forEach(doc => {
      const data = doc.data();
      categoryLimits[data.name] = data.limit || 0;
    });

    // Create categories array
    const categories: Category[] = Object.keys(categoryTotals).map(name => {
      const spent = categoryTotals[name];
      const limit = categoryLimits[name] || period.limit || 1000; // Default to overall limit or 1000
      const meta = categoryMeta[name] || categoryMeta.Other;

      return {
        id: name,
        name,
        spent,
        limit,
        color: meta.color,
        icon: meta.icon,
        userId: currentUser.uid,
      };
    });

    // Sort categories by spent amount (descending)
    return categories.sort((a, b) => b.spent - a.spent);
  } catch (error) {
    console.error('Error fetching categories with expenses:', error);
    return [];
  }
};

// Export the function for backwads compatibility with old code
export const getGroupedExpensesByCategory = fetchCategoriesWithExpenses;