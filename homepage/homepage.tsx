import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, ScrollView, SafeAreaView, StatusBar, Text, Button, TouchableOpacity } from 'react-native';
import { pickAndProcessImage } from '../ocr'; // Import pickAndProcessImage from ocr.ts
import SmsParser from '../smsparser'; // Import SmsParser as a React component
import CircularProgress from './components/circularprogress'; // Import CircularProgress
import CategoryListContainer from './components/categorylist'; // Import CategoryListContainer
import TimeRemainingHeader from './components/timeremainingheader'; // Import TimeRemainingHeader
import Header from './components/header'; // Import Header
import { COLORS } from '../theme'; // Import theme
import { Category } from './components/category'; // Import Category type
import BottomTabs from './components/bottomtabs'; // Import BottomTabs
import AddLimitModal from './components/addlimit'; // Import AddLimitModal component
import { NavigationContainer } from '@react-navigation/native';

export default function Homepage() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState<number | null>(null); // Amount detected from the image
  const [currency, setCurrency] = useState<string | null>(null);
  const [totalSpent, setTotalSpent] = useState<number>(0); // Dynamically set the total spent value
  const [spentPercentage] = useState(60); // This could be calculated based on totalSpent and limits in the future
  
  const [modalVisible, setModalVisible] = useState<boolean>(false); // To manage the visibility of the modal

  const [smsText, setSmsText] = useState<string>(''); // State for SMS content
  const [extractedAmount, setExtractedAmount] = useState<string | null>(null); // State for extracted amount

  // Using useEffect to update totalSpent whenever totalAmount changes
  useEffect(() => {
    if (totalAmount !== null) {
      setTotalSpent(totalAmount); // Dynamically update totalSpent based on image amount
    }
  }, [totalAmount]); // This will run whenever totalAmount changes

  // Callback to update SMS content
  const handleSmsReceived = (sms: string) => {
    setSmsText(sms);
  };

  // Callback to update extracted amount
  const handleAmountExtracted = (amount: string) => {
    setExtractedAmount(amount);
  };

  // Function to trigger image picker and set the total spent amount
  const handleAddPress = () => {
    pickAndProcessImage(setImageUri, setTotalAmount, setCurrency);
  };

  const handleLimitSet = (newLimit: number) => {
    console.log('New limit set:', newLimit); // This is where you would update the state with the new limit
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      
      {/* Header Component */}
      <Header />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image Picker Section
        {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
         */}
        {/* Circle Progress for Expense Tracker */}
        <CircularProgress percentage={spentPercentage} totalSpent={totalSpent} />

        {/* View to place TimeRemainingHeader and AddLimit next to each other */}
        <View style={styles.row}>
          {/* Time Remaining Header */}
          <TimeRemainingHeader />
          
          {/* Add Limit Button */}
          <TouchableOpacity style={styles.setGoalButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.setGoalButtonText}>Set Goal</Text>
            </TouchableOpacity>


        </View>

        {/* Category List */}
        <CategoryListContainer />

        {/* SMS Content and Extracted Amount */}
        <View style={styles.smsContainer}>
          <Text style={styles.smsText}>Received SMS: {smsText}</Text>
          <Text style={styles.smsText}>
            Extracted Amount: {extractedAmount ? extractedAmount : 'No amount detected'}
          </Text>
        </View>
      </ScrollView>

     
     

      {/* Include the SmsParser component */}
      <SmsParser
        onSmsReceived={handleSmsReceived}
        onAmountExtracted={handleAmountExtracted}
      />

       {/* AddLimitModal with visibility and onClose handlers */}
       <AddLimitModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onLimitSet={handleLimitSet}

        />
       
      {/* Bottom Tabs with onAddPress prop */}
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
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 20,
    borderRadius: 10,
  },
  smsContainer: {
    marginTop: 30,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#e3e3e3',
    width: '80%',
    alignItems: 'center',
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
  setGoalButton: {
    backgroundColor: COLORS.yellow,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginLeft: 75,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  setGoalButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
});
