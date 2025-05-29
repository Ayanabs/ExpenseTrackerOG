
import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View, ScrollView, StatusBar, Text, StyleSheet, ActivityIndicator, RefreshControl
} from 'react-native';
import { AppContext } from '../App';
import AddExpenseModal from './components/addexpensemodal';
import { pickAndProcessImage } from '../ocr';
import { Category } from './components/category';
import SmsParser from '../smsparser';
import CircularProgress from './components/circularprogress';
import CategoriesContainer from './components/categorylist';
import TimeRemainingHeader from './components/timeremainingheader';
import Header from './components/header';
import AddLimitModal from './components/setgoal';
import BottomTabs from './components/bottomtabs';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { fetchCategoriesWithExpenses } from './components/categoryservice';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../theme';
import { fetchSpendingLimit } from '../database/firebaseConfig';
import takeAndProcessPhoto from '../cameraocr';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Homepage() {
  const { isRefreshing, refreshData } = useContext(AppContext);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [maxtotal, setMaxtotal] = useState(0);
  const [spentPercentage, setSpentPercentage] = useState(0);
  const [smsText, setSmsText] = useState('');
  const [extractedAmount, setExtractedAmount] = useState<string | number | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [totalSpent, setTotalSpent] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Authentication state listener
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(user => {
      resetAllState();

      if (user) {
        console.log("User is signed in:", user.uid);
        fetchUserData(user.uid);
      } else {
        console.log("User is signed out");
        setIsLoading(false);
        setIsCategoriesLoading(false);
      }
    });

    return subscriber;
  }, []);

  const resetAllState = () => {
    setImageUri(null);
    setCategories([]);
    setMaxtotal(0);
    setSpentPercentage(0);
    setSmsText('');
    setExtractedAmount(null);
    setRemainingTime(0);
    setTotalDuration(0);
    setStartDate(null);
    setEndDate(null);
    setTotalSpent(0);
    setIsLoading(true);
    setIsCategoriesLoading(true);
  };

  const fetchUserData = async (userId: string) => {
    try {
      setIsLoading(true);
      setIsCategoriesLoading(true);

      await fetchSpendingLimit();
      const categoriesData = await fetchCategoriesWithExpenses();
      console.log('Categories data:', categoriesData);
      setCategories(categoriesData);

      setIsLoading(false);
      setIsCategoriesLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setIsLoading(false);
      setIsCategoriesLoading(false);
    }
  };

  const refreshCategories = async () => {
    try {
      setIsCategoriesLoading(true);
      const categoriesData = await fetchCategoriesWithExpenses();
      setCategories(categoriesData);
      setIsCategoriesLoading(false);
    } catch (error) {
      console.error('Error refreshing categories:', error);
      setIsCategoriesLoading(false);
    }
  };

  // Spending limit realtime listener
  useEffect(() => {
    const currentUser = auth().currentUser;
    if (!currentUser) return () => { };

    const spendingLimitDocRef = firestore()
      .collection('spendingLimits')
      .doc(currentUser.uid);

    const unsubscribe = spendingLimitDocRef.onSnapshot(
      (spendingLimitDoc) => {
        if (spendingLimitDoc.exists) {
          const spendingLimitData = spendingLimitDoc.data();
          if (spendingLimitData) {
            setMaxtotal(spendingLimitData.limit);
            const start = spendingLimitData.startDate.toDate();
            const end = spendingLimitData.endDate.toDate();
            setStartDate(start);
            setEndDate(end);
            setTotalDuration(Math.floor((end.getTime() - start.getTime()) / 1000));

            console.log('Spending limit updated:', {
              limit: spendingLimitData.limit,
              startDate: start,
              endDate: end
            });
          }
        } else {
          setMaxtotal(0);
          setStartDate(null);
          setEndDate(null);
          setTotalDuration(0);
        }
      },
      (error) => {
        console.error('Error fetching spending limit:', error);
      }
    );

    return () => unsubscribe();
  }, []);


  useEffect(() => {
    if (!startDate || !endDate) {
      console.log('No date range set, skipping expenses listener');
      return () => { };
    }

    const currentUser = auth().currentUser;
    if (!currentUser) {
      console.log('No current user, skipping expenses listener');
      return () => { };
    }

    console.log('Setting up expenses listener for date range:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      userId: currentUser.uid
    });

    const expensesCollectionRef = firestore()
      .collection('expenses')
      .where('userId', '==', currentUser.uid)
      .where('date', '>=', firestore.Timestamp.fromDate(startDate))
      .where('date', '<=', firestore.Timestamp.fromDate(endDate));

    const unsubscribe = expensesCollectionRef.onSnapshot(
      async (snapshot) => {
        console.log('Expenses snapshot received, documents count:', snapshot.size);

        // Calculate total spent with detailed logging
        let total = 0;
        let smsTotal = 0;
        let expenseDetails: any[] = [];

        snapshot.forEach((doc) => {
          const expenseData = doc.data();
          const amount = parseFloat(expenseData.amount?.toString() || '0');

          expenseDetails.push({
            id: doc.id,
            amount: amount,
            source: expenseData.source,
            category: expenseData.category,
            date: expenseData.date?.toDate?.()?.toISOString() || 'No date'
          });

          total += amount;

          // Track SMS-specific expenses
          if (expenseData.source?.includes('SMS') || expenseData.category === 'SMS') {
            smsTotal += amount;
          }
        });

        console.log('Expense calculation details:', {
          totalExpenses: snapshot.size,
          totalAmount: total,
          smsAmount: smsTotal,
          expenseDetails: expenseDetails
        });

        setTotalSpent(total);

       
        if (maxtotal > 0) {
          const percentage = (total / maxtotal) * 100;
          console.log('Updating spent percentage:', percentage);
          setSpentPercentage(percentage);
        }

        // Refresh categories when expenses change
        console.log('Refreshing categories after expense update...');
        await refreshCategories();
      },
      (error) => {
        console.error('Error in expenses listener:', error);
      }
    );

    return () => {
      console.log('Cleaning up expenses listener');
      unsubscribe();
    };
  }, [startDate, endDate, maxtotal]);

  // Timer countdown
  useEffect(() => {
    if (!startDate || !endDate) return () => { };

    const interval = setInterval(() => {
      const currentTime = new Date().getTime();
      const timeRemaining = Math.max(0, endDate.getTime() - currentTime);
      setRemainingTime(Math.floor(timeRemaining / 1000));

      if (timeRemaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startDate, endDate]);

  const handleSmsReceived = (sms: string) => {
    console.log('SMS received in Homepage:', sms);
    setSmsText(sms);
  };

 
  const handleAmountExtracted = (amount: string | number) => {
    console.log('Amount extracted from SMS:', amount);
    setExtractedAmount(amount);

    // Force a refresh of categories after a short delay to ensure Firestore has updated
    setTimeout(() => {
      console.log('Delayed refresh after SMS processing...');
      refreshCategories();
    }, 1000);
  };

  const handleAddPress = () => {
    pickAndProcessImage(
      setImageUri,
      (amt) => {
        if (amt !== null) {
          refreshCategories();
        }
      },
      () => { },
      () => { }
    );
  };

  const handleTakePhoto = () => {
    takeAndProcessPhoto(
      setImageUri,
      (amt) => {
        if (amt !== null) {
          refreshCategories();
        }
      },
      () => { },
      () => { }
    );
  };

  const handleLimitSet = async ({ limit: newLimit, days, hours }: { limit: number; days: number; hours: number }) => {
    try {
      const start = new Date();
      const end = new Date(start.getTime() + (days * 24 * 60 * 60 * 1000) + (hours * 60 * 60 * 1000));

      const currentUser = auth().currentUser;
      if (!currentUser) return;

      console.log('Setting new spending limit:', {
        limit: newLimit,
        startDate: start.toISOString(),
        endDate: end.toISOString()
      });

      await firestore().collection('spendingLimits').doc(currentUser.uid).set({
        limit: newLimit,
        startDate: firestore.Timestamp.fromDate(start),
        endDate: firestore.Timestamp.fromDate(end),
        userId: currentUser.uid
      });
    } catch (error) {
      console.error('Error setting spending limit:', error);
    }
  };
  const handleExpenseAdded = () => {
    console.log('Manual expense added, refreshing data...');
    refreshCategories();
  };
  const onRefresh = useCallback(async () => {
    if (!auth().currentUser) return;

    try {
      console.log('Manual refresh triggered');
      setRefreshing(true);

      await fetchSpendingLimit();
      await refreshCategories();

      setRefreshing(false);
    } catch (error) {
      console.error('Error during refresh:', error);
      setRefreshing(false);
      if (refreshData) refreshData();
    }
  }, [refreshData]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.white} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['right', 'left', 'bottom', 'top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} translucent={false} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#8A4FFF"]}
            tintColor="#8A4FFF"
            title="Refreshing data..."
            titleColor="#FFFFFF"
            progressBackgroundColor={COLORS.background}
          />
        }
      >

        <View style={styles.dashboardContainer}>
          <CircularProgress percentage={spentPercentage} totalSpent={totalSpent} maxtotal={maxtotal} />
          <View style={styles.row}>
            <TimeRemainingHeader remainingTime={remainingTime} totalDuration={totalDuration} />
            <AddLimitModal onLimitSet={handleLimitSet} />
          </View>
        </View>
        <View style={styles.addExpenseContainer}>
          <TouchableOpacity
            style={styles.addExpenseButton}
            onPress={() => setShowAddExpenseModal(true)}
            activeOpacity={0.8}
          >
            <Icon name="plus-circle" size={24} color={COLORS.white} />
            <Text style={styles.addExpenseButtonText}>ADD MANUAL EXPENSE</Text>
          </TouchableOpacity>
        </View>

        <AddExpenseModal
          visible={showAddExpenseModal}
          onClose={() => setShowAddExpenseModal(false)}
          onExpenseAdded={handleExpenseAdded}
        />
        <CategoriesContainer
          categories={categories}
          isLoading={isCategoriesLoading || isRefreshing || refreshing}
        />

      
        <SmsParser
          onSmsReceived={handleSmsReceived}
          onAmountExtracted={handleAmountExtracted}
          setTotalSpent={(amount) => {
            console.log('SMS Parser setTotalSpent called with:', amount);
            
            refreshCategories();
          }}
        />
      </ScrollView>
      <BottomTabs onAddPress={handleAddPress} onTakePhoto={handleTakePhoto} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 20,
    backgroundColor: COLORS.white,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.white,
  },
  timeRemainingText: {
    color: COLORS.black,
    fontSize: 14,
    marginTop: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  dashboardContainer: {
    marginTop: 25,
    marginHorizontal: 8,
    marginBottom: 16,
    padding: 15,
    backgroundColor: COLORS.background || '#1E1E2E',
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  addExpenseContainer: {
    marginHorizontal: 8,
    marginBottom: 16,
  },
  addExpenseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary || '#8A4FFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  addExpenseButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
});