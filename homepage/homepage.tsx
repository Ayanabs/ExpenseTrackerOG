import React, { useState, useEffect } from 'react';
import {
  View, Image, StyleSheet, ScrollView, StatusBar, Text, Platform, TouchableOpacity
} from 'react-native';
import { pickAndProcessImage } from '../ocr';
import SmsParser from '../smsparser';
import CircularProgress from './components/circularprogress';
import CategoryListContainer from './components/categorylist';
import TimeRemainingHeader from './components/timeremainingheader';
import Header from './components/header';
import { COLORS } from '../theme';
import BottomTabs from './components/bottomtabs';
import AddLimitModal from './components/setgoal';
import { useFocusEffect } from '@react-navigation/native';
import { getCurrentSpendingLimitPeriod, updateSpendingLimitPeriod } from './realmHelpers';
import { useRealm } from '@realm/react';
import { SafeAreaProvider, SafeAreaView as CustomSafeAreaView } from 'react-native-safe-area-context';
import { observeSpendingLimitTotal } from './observeSpendingLimitTotal';


export default function Homepage() {
  const realm = useRealm();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [maxtotal, setMaxtotal] = useState<number>(0);
  const [spentPercentage, setSpentPercentage] = useState<number>(0);
  const [smsText, setSmsText] = useState<string>('');
  const [extractedAmount, setExtractedAmount] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(0);

  useEffect(() => {
    let unsubscribe: () => void = () => {};
  
    const observeTotal = async () => {
      const result = await observeSpendingLimitTotal(realm, setTotalSpent);
      if (result) unsubscribe = result;
    };
  
    observeTotal();
  
    return () => {
      unsubscribe();
    };
  }, [realm]);
  
  

  useEffect(() => {
    if (maxtotal > 0 && totalSpent >= 0) {
      setSpentPercentage((totalSpent / maxtotal) * 100);
    }
  }, [totalSpent, maxtotal]);

  const updateTimeRemaining = async () => {
    const currentPeriod = await getCurrentSpendingLimitPeriod(realm);

    if (currentPeriod) {
      const now = new Date().getTime();
      const end = new Date(currentPeriod.endDate).getTime();
      const start = new Date(currentPeriod.startDate).getTime();
      setRemainingTime(Math.max(0, Math.floor((end - now) / 1000)));
      setTotalDuration(Math.floor((end - start) / 1000));
    }
  };

  useEffect(() => {
    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchSpendingLimit = async () => {
      const currentPeriod = await getCurrentSpendingLimitPeriod(realm);
      if (currentPeriod) {
        setMaxtotal(currentPeriod.limit);
      }
    };

    fetchSpendingLimit();
  }, []);

  const handleSmsReceived = (sms: string) => setSmsText(sms);
  const handleAmountExtracted = (amount: string) => setExtractedAmount(amount);

  const handleAddPress = () => {
    pickAndProcessImage(
      setImageUri,
      amt => setTotalSpent(amt ?? 0),
      () => { },
      () => { },
      realm
    );
  };

  const handleLimitSet = async (newLimit: number) => {
    const currentPeriod = await getCurrentSpendingLimitPeriod(realm);
    if (currentPeriod) {
      await updateSpendingLimitPeriod(realm, currentPeriod.startDate, currentPeriod.endDate, newLimit);
    }
    setMaxtotal(newLimit);
    updateTimeRemaining();
  };

  return (
    <SafeAreaProvider>
      <CustomSafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Header />
          <CircularProgress percentage={spentPercentage} totalSpent={totalSpent} maxtotal={maxtotal} />
          <View style={styles.row}>
            <TimeRemainingHeader remainingTime={remainingTime} totalDuration={totalDuration} />
            <AddLimitModal onLimitSet={handleLimitSet} />
          </View>

          <CategoryListContainer />

          <View style={styles.smsContainer}>
            <Text style={styles.smsText}>Received SMS: {smsText}</Text>
            <Text style={styles.smsText}>
              Extracted Amount: {extractedAmount ? extractedAmount : 'No amount detected'}
            </Text>
          </View>
        </ScrollView>

        <SmsParser onSmsReceived={handleSmsReceived} onAmountExtracted={handleAmountExtracted} />
        <BottomTabs onAddPress={handleAddPress} />
      </CustomSafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
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
