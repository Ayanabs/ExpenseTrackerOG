import React, { useState, useEffect } from 'react';
import {
  View, ScrollView, StatusBar, Text, StyleSheet
} from 'react-native';
import { pickAndProcessImage } from '../ocr';
import SmsParser from '../smsparser';
import CircularProgress from './components/circularprogress';
import CategoryListContainer from './components/categorylist';
import TimeRemainingHeader from './components/timeremainingheader';
import Header from './components/header';
import AddLimitModal from './components/setgoal';
import BottomTabs from './components/bottomtabs'; 
import firestore from '@react-native-firebase/firestore';

export default function Homepage() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [maxtotal, setMaxtotal] = useState<number>(0);
  const [spentPercentage, setSpentPercentage] = useState<number>(0);
  const [smsText, setSmsText] = useState<string>('');  // To display received SMS
  const [extractedAmount, setExtractedAmount] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0); // Remaining time in seconds
  const [totalDuration, setTotalDuration] = useState<number>(0); // Total duration in seconds
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [categories, setCategories] = useState<any[]>([]); // State to hold categories data

  // Fetch the current spending limit from Firestore
  const fetchSpendingLimit = async () => {
    try {
      const spendingLimitDoc = await firestore().collection('spendingLimits').doc('currentLimit').get();
      if (spendingLimitDoc.exists) {
        const spendingLimitData = spendingLimitDoc.data();
        if (spendingLimitData) {
          setMaxtotal(spendingLimitData.limit);
          const start = spendingLimitData.startDate.toDate();
          const end = spendingLimitData.endDate.toDate();
          setStartDate(start);
          setEndDate(end);
          setTotalDuration(Math.floor((end.getTime() - start.getTime()) / 1000)); // Set total duration in seconds
          calculateTotalSpent(start, end);
        }
      }
    } catch (error) {
      console.error('Error fetching spending limit:', error);
    }
  };

  // Fetch category data from Firestore
  const fetchCategories = async () => {
    try {
      const categorySnapshot = await firestore().collection('categories').get();
      const categoryData = categorySnapshot.docs.map(doc => doc.data());
      setCategories(categoryData); // Update state with fetched categories
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Calculate the total spent within the current period
  const calculateTotalSpent = async (startDate: Date, endDate: Date) => {
    try {
      const snapshot = await firestore().collection('expenses')
        .where('date', '>=', startDate)
        .where('date', '<=', endDate)
        .get();
        
      const expenses = snapshot.docs.map(doc => doc.data());
      const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      setTotalSpent(totalSpent);
      setSpentPercentage((totalSpent / maxtotal) * 100);
    } catch (error) {
      console.error('Error calculating total spent:', error);
    }
  };

  useEffect(() => {
    fetchSpendingLimit(); // Fetch spending limit and calculate the total spent when the component mounts
    fetchCategories(); // Fetch categories when the component mounts
  }, []);

  // Timer countdown logic
  useEffect(() => {
    if (startDate && endDate) {
      const interval = setInterval(() => {
        const currentTime = new Date().getTime();
        const timeRemaining = Math.max(0, endDate.getTime() - currentTime); // Prevent negative values
        setRemainingTime(Math.floor(timeRemaining / 1000)); // Convert milliseconds to seconds

        if (timeRemaining <= 0) {
          clearInterval(interval); // Stop the interval when the time is up
        }
      }, 1000); // Update every second

      // Cleanup interval on component unmount
      return () => clearInterval(interval);
    }
  }, [startDate, endDate]);

  const handleSmsReceived = (sms: string) => {
    console.log('SMS Received:', sms);  // Log the SMS content for debugging
    setSmsText(sms);  // Store the received SMS text
  };

  const handleAmountExtracted = (amount: string) => {
    console.log('Extracted Amount:', amount);  // Log the extracted amount for debugging
    setExtractedAmount(amount);  // Store the extracted amount

    // Update total spent with the extracted amount
    setTotalSpent((prevTotal) => prevTotal + parseFloat(amount));
  };

  // Handle the process of adding a new image and updating total spent
  const handleAddPress = () => {
    pickAndProcessImage(
      setImageUri,
      (amt: number | null) => {
        if (amt !== null) {
          setTotalSpent(prevTotal => parseFloat((prevTotal + amt).toFixed(2)));
        }
      },
      () => {},
      () => {}
    );
  };

  const handleLimitSet = async ({ limit: newLimit, days, hours }: { limit: number; days: number; hours: number }) => {
    try {
      const start = new Date(); // Set the start date to the current date
      const end = new Date(start.getTime() + (days * 24 * 60 * 60 * 1000) + (hours * 60 * 60 * 1000)); // Calculate end date by adding days and hours

      await firestore().collection('spendingLimits').doc('currentLimit').set({
        limit: newLimit,
        startDate: firestore.Timestamp.fromDate(start), // Set the start date
        endDate: firestore.Timestamp.fromDate(end), // Set the end date based on user input
      });

      setMaxtotal(newLimit);
      fetchSpendingLimit();
    } catch (error) {
      console.error('Error setting spending limit:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <StatusBar barStyle="light-content" />
      <Header />
      <CircularProgress percentage={spentPercentage} totalSpent={totalSpent} maxtotal={maxtotal} />
      <View style={styles.row}>
        <TimeRemainingHeader remainingTime={remainingTime} totalDuration={totalDuration} />
        <AddLimitModal onLimitSet={handleLimitSet} />
      </View>

      {/* Pass categories data to CategoryListContainer */}
      <CategoryListContainer categories={categories} groupedExpenses={{}} />

      <View style={styles.smsContainer}>
        <Text style={styles.smsText}>Received SMS: {smsText}</Text>
        <Text style={styles.smsText}>
          Extracted Amount: {extractedAmount ? extractedAmount : 'No amount detected'}
        </Text>
      </View>

      <SmsParser
        onSmsReceived={handleSmsReceived}
        onAmountExtracted={handleAmountExtracted}
        setTotalSpent={setTotalSpent} // Pass setTotalSpent to SmsParser
      />

      <BottomTabs onAddPress={handleAddPress} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  smsContainer: {
    marginTop: 30,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#e3e3e3',
    width: '80%',
    alignItems: 'center',
    alignSelf: 'center',
  },
  smsText: {
    fontSize: 16,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
});
