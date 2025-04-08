import React, { useState } from 'react';
import { View, Button, Text, Image, StyleSheet } from 'react-native';
import { pickAndProcessImage } from './ocr'; // Import pickAndProcessImage from ocr.ts
import SmsParser from './smsparser'; // Import SmsParser as a React component
import CircularProgress from './homepage/components/circularprogress'; // Import CircularProgress

export default function Homepage() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string | null>(null);
  const [smsText, setSmsText] = useState<string>(''); // State for SMS content
  const [extractedAmount, setExtractedAmount] = useState<string | null>(null); // State for extracted amount

  // Callback to update SMS content
  const handleSmsReceived = (sms: string) => {
    setSmsText(sms);
  };

  // Callback to update extracted amount
  const handleAmountExtracted = (amount: string) => {
    setExtractedAmount(amount);
  };

  return (
    <View style={styles.container}>
      
  
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      
      <View style={styles.button}>
        <Button
          title="Pick Image"
          onPress={() => pickAndProcessImage(setImageUri, setTotalAmount, setCurrency)}
        />
      </View>
      
      <Text style={styles.text}>
        Total Amount: {totalAmount !== null ? `${currency ?? ''} ${totalAmount.toFixed(2)}` : 'No total detected'}
      </Text>

      {/* Display SMS content and extracted amount */}
      <View style={styles.smsContainer}>
        <Text style={styles.smsText}>Received SMS: {smsText}</Text>
        <Text style={styles.smsText}>
          Extracted Amount: {extractedAmount ? extractedAmount : 'No amount detected'}
        </Text>
      </View>

      {/* Include the SmsParser component */}
    
      <SmsParser
  onSmsReceived={handleSmsReceived}
  onAmountExtracted={handleAmountExtracted}
/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 20,
    borderRadius: 10,
  },
  button: {
    marginVertical: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
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
});

