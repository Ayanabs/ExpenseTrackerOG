import * as ImagePicker from 'react-native-image-picker';
import Realm from 'realm';
import { Expense } from './database/expenses'; // Adjust the path if needed

/**
 * Sends image to FastAPI backend for OCR processing and saves result to Realm
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

    const response = await fetch('https://ocr-py-production.up.railway.app/ocr', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) throw new Error('Server Error');

    const data = await response.json();
    console.log('OCR response:', data);

    const amount = data.total ?? null;
    const date = data.date ? new Date(data.date) : new Date(); // fallback to now
    const currency = data.currency ?? null;
    const category = data.category ?? 'Uncategorized';

    if (amount) {
      const realm = await Realm.open({ schema: [Expense] });

      realm.write(() => {
        realm.create('Expense', {
          _id: new Realm.BSON.ObjectId(),
          amount,
          source: 'Receipt',
          date,
          category,
        });
      });
    }

    setTotalAmount(amount);
    setCurrency(currency);
    setCategory(category);
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
