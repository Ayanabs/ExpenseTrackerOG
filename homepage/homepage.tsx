import React, { useState, useEffect, useContext } from 'react';
import {
  View, ScrollView, StatusBar, Text, StyleSheet, ActivityIndicator
} from 'react-native';
import { AppContext } from '../App'; // Import the context

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

export default function Homepage() {
  const { isRefreshing } = useContext(AppContext);
  
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

  // Authentication state listener
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(user => {
      // Reset all state values when auth state changes
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
  
    return subscriber; // Unsubscribe on unmount
  }, []);

  // Reset all state values
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

  // Fetch user data including spending limit and categories
  const fetchUserData = async (userId: string) => {
    try {
      setIsLoading(true);
      setIsCategoriesLoading(true);
      
      // Fetch the spending limit
      await fetchSpendingLimit();
      
      // Fetch categories with expenses
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
  
  // Refresh categories data
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
  
  // Spending limit real-time listener
  useEffect(() => {
    const currentUser = auth().currentUser;
    if (!currentUser) return () => {};
  
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
          }
        } else {
          // Default values if no document exists
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

  // Expenses real-time listener
  useEffect(() => {
    if (!startDate || !endDate) return () => {};
  
    const currentUser = auth().currentUser;
    if (!currentUser) return () => {};
  
    const expensesCollectionRef = firestore()
      .collection('expenses')
      .where('userId', '==', currentUser.uid)
      .where('date', '>=', firestore.Timestamp.fromDate(startDate))
      .where('date', '<=', firestore.Timestamp.fromDate(endDate));
  
    const unsubscribe = expensesCollectionRef.onSnapshot(
      async (snapshot) => {
        // Calculate total spent
        let total = 0;
        snapshot.forEach((doc) => {
          const expenseData = doc.data();
          if (expenseData.amount) {
            total += parseFloat(expenseData.amount.toString());
          }
        });
  
        console.log(`Total spent: ${total}`);
        setTotalSpent(total);
  
        if (maxtotal > 0) {
          const percentage = (total / maxtotal) * 100;
          setSpentPercentage(percentage);
        }
        
        // Refresh categories when expenses change
        await refreshCategories();
      },
      (error) => {
        console.error('Error fetching expenses:', error);
      }
    );
  
    return () => unsubscribe();
  }, [startDate, endDate, maxtotal]);
  
  // Timer countdown
  useEffect(() => {
    if (!startDate || !endDate) return () => {};
    
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
    setSmsText(sms);
  };

  const handleAmountExtracted = (amount: string | number) => {
    setExtractedAmount(amount);
    setTotalSpent((prevTotal) => prevTotal + parseFloat(amount.toString()));
    refreshCategories();
  };

  // Handle receipt image processing
  const handleAddPress = () => {
    pickAndProcessImage(
      setImageUri,
      (amt) => {
        if (amt !== null) {
          setTotalSpent(prevTotal => parseFloat((prevTotal + amt).toFixed(2)));
          refreshCategories();
        }
      },
      () => {},
      () => {}
    );
  };

  // Handle setting a new spending limit
  const handleLimitSet = async ({ limit: newLimit, days, hours }: { limit: number; days: number; hours: number }) => {
    try {
      const start = new Date();
      const end = new Date(start.getTime() + (days * 24 * 60 * 60 * 1000) + (hours * 60 * 60 * 1000));
      
      const currentUser = auth().currentUser;
      if (!currentUser) return;
      
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8A4FFF" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['right', 'left', 'bottom','top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} translucent={false} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Header />
        <CircularProgress percentage={spentPercentage} totalSpent={totalSpent} maxtotal={maxtotal} />
        <View style={styles.row}>
          <TimeRemainingHeader remainingTime={remainingTime} totalDuration={totalDuration} />
          <AddLimitModal onLimitSet={handleLimitSet} />
        </View>

        {/* Categories section */}
        <CategoriesContainer 
          categories={categories} 
          isLoading={isCategoriesLoading || isRefreshing} 
        />

        {/* SMS Parser section */}
        <SmsParser
          onSmsReceived={handleSmsReceived}
          onAmountExtracted={handleAmountExtracted}
          setTotalSpent={setTotalSpent}
        />
      </ScrollView>
      <BottomTabs onAddPress={handleAddPress} />
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
    backgroundColor: COLORS.background,
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
  }
});