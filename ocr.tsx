import * as ImagePicker from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import { Expense } from './database/expense'; // Assuming you have an interface or type for Expense

/**
 * Sends image to FastAPI backend for OCR processing and saves result to Firestore
 */
const processImage = async (
  uri: string,
  setTotalAmount: (amount: number | null) => void,
  setCurrency: (currency: string | null) => void,
  setCategory: (category: string | null) => void
) => {
  try {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'receipt.jpg';
    const fileType = filename.split('.').pop();

    formData.append('file', {
      uri,
      name: filename,
      type: `image/${fileType}`,
    } as any); // React Native types workaround

    const response = await fetch('https://ocr-llamaa-production.up.railway.app/ocr', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) throw new Error('Server Error');

    const data = await response.json();
    console.log('OCR response:', data);

    const amount = data.total ? parseFloat(parseFloat(data.total).toFixed(2)) : null; // Formatting amount as a number
    const date = data.date ? new Date(data.date) : new Date();
    const currency = data.currency ?? null;
    const category = data.category ?? 'Uncategorized';

    // Fetch the current spending period from Firestore (like in SMS parser)
    const currentPeriodDoc = await firestore().collection('spendingLimits').doc('currentLimit').get();
    if (!currentPeriodDoc.exists) {
      console.error('No current spending period found!');
      return;
    }

    const currentPeriod = currentPeriodDoc.data();
    if (!currentPeriod) {
      console.error('No data found for the spending period!');
      return;
    }

    if (amount !== null) {
      // Save the OCR data to Firestore with the fetched period
      await firestore().collection('expenses').add({
        amount: amount, // Store the formatted amount
        source: 'Receipt', // OCR source
        date: firestore.Timestamp.fromDate(new Date()),  // Firestore timestamp for the date
        category,
        period: currentPeriod, // Add the current spending period
      });

      setTotalAmount(amount); // Update the total amount in the state
      setCurrency(currency);
      setCategory(category);
    }
  } catch (error) {
    console.error('OCR processing error:', error);
    setTotalAmount(null);
    setCurrency(null);
    setCategory(null);
  }
};

/**
 * Handles image selection and processing
 */
export const pickAndProcessImage = async (
  setImageUri: (uri: string | null) => void,
  setTotalAmount: (amount: number | null) => void,
  setCurrency: (currency: string | null) => void,
  setCategory: (category: string | null) => void
) => {
  let result = await ImagePicker.launchImageLibrary({
    mediaType: 'photo',
    selectionLimit: 1,
    quality: 1,
  });

  if (!result.didCancel && result.assets && result.assets.length > 0) {
    const uri = result.assets[0].uri ?? null;
    setImageUri(uri);
    if (uri) {
      await processImage(uri, setTotalAmount, setCurrency, setCategory);
    }
  }
};
