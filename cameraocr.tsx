import * as ImagePicker from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

/**
 * Processes an image captured from camera with OCR and saves result to Firestore
 */
const processImage = async (
  uri: string,
  setTotalAmount: (amount: number | null) => void,
  setCurrency: (currency: string | null) => void = () => {},
  setCategory: (category: string | null) => void = () => {}
) => {
  try {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'receipt.jpg';
    const fileType = filename.split('.').pop();
    
    formData.append('file', {
      uri,
      name: filename,
      type: `image/${fileType}`,
    } as any); 
    
    const response = await fetch('https://93743526-851e-40d0-ab2f-57ee5aeeb6b3-00-3rife4kkxru97.pike.replit.dev/ocr', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (!response.ok) throw new Error('Server Error');
    
    const data = await response.json();
    console.log('OCR response:', data);
    
    const amount = data.total ? parseFloat(parseFloat(data.total).toFixed(2)) : null;
    const date = data.date ? new Date(data.date) : new Date();
    const currency = data.currency ?? null;
    const category = data.category ?? 'Uncategorized';
    
    // Get current user ID directly from Firebase Auth
    const currentUser = auth().currentUser;
    if (!currentUser) {
      console.error('No authenticated user found!');
      return;
    }
    
    if (amount !== null) {
      // Save the OCR data to Firestore with userId
      await firestore().collection('expenses').add({
        amount: amount,
        source: 'Receipt',
        date: firestore.Timestamp.fromDate(new Date()),
        category,
        userId: currentUser.uid, // Add userId for proper filtering
      });
      
      console.log('Receipt expense saved successfully to Firestore');
          
      setTotalAmount(amount);
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
 * Handles taking a photo with the device camera and processes it
 */
export const takeAndProcessPhoto = async (
  setImageUri: (uri: string | null) => void,
  setTotalAmount: (amount: number | null) => void,
  setCurrency: (currency: string | null) => void = () => {},
  setCategory: (category: string | null) => void = () => {}
) => {
  try {
    // Launch the camera for photo capture
    const result = await ImagePicker.launchCamera({
      mediaType: 'photo',
      quality: 1,
      saveToPhotos: true,
      includeBase64: false,
    });

    // Process camera result
    if (!result.didCancel && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri ?? null;
      setImageUri(uri);
      
      if (uri) {
        // Process the captured image with OCR
        await processImage(uri, setTotalAmount, setCurrency, setCategory);
      }
    }
  } catch (error) {
    console.error('Camera capture error:', error);
    setImageUri(null);
    setTotalAmount(null);
    setCurrency(null);
    setCategory(null);
  }
};

export default takeAndProcessPhoto;