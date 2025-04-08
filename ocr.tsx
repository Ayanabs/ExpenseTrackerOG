import * as ImagePicker from "react-native-image-picker";
import recognizeText from "@react-native-ml-kit/text-recognition";

/**
 * Extracts the most relevant currency symbol from OCR text
 */
const extractCurrency = (text: string): string | null => {
  const currencyRegex = /(\$|Rs\.?|LKR\.?)/gi;
  const matches: RegExpExecArray[] = [];
  let match;
  while ((match = currencyRegex.exec(text)) !== null) {
    matches.push(match);
  }

  if (matches.length > 0) {
    return matches[matches.length - 1][1]; // Picks the last detected currency symbol
  }

  return null; // Default if no currency found
};

/**
 * Extracts the total amount from OCR text
 */
const extractTotal = (text: string): number => {
  console.log("Processing Text:", text); // Debugging

  // ✅ Step 1: First, find all currency values (prioritizing them)
  const currencyRegex = /(?:\$|Rs\.?|LKR\.?)\s*(\d+(\.\d{1,2})?)/gi;
  const currencyMatches = Array.from(text.matchAll(currencyRegex));
  const currencyAmounts = currencyMatches.map((match) => parseFloat(match[1]));

  if (currencyAmounts.length > 0) {
    return Math.max(...currencyAmounts); // Pick the highest currency value
  }

  // ✅ Step 2: Match keywords like "Total", "Grand Total", "Amount Due" (ignoring "Sub-total")
  const totalRegex = /(?:total|grand total|amount due|balance|amount)\s*[:\-]?\s*(\d+(\.\d{1,2})?)/gi;
  const totalMatches = Array.from(text.matchAll(totalRegex));

  if (totalMatches.length > 0) {
    return parseFloat(totalMatches[totalMatches.length - 1][1]); // Get last valid total
  }

  // ✅ Step 3: As a final fallback, find the **largest standalone number**
  const numbers = text.match(/\d+(\.\d{1,2})?/g);
  if (numbers) {
    const validAmounts = numbers.map(Number).filter((num) => num > 1.0);
    return validAmounts.length > 0 ? validAmounts[validAmounts.length - 1] : 0;
  }

  return 0; // Default if no valid total found
};

/**
 * Processes the image with OCR and extracts total amount
 */
const processImage = async (
    uri: string,
    setTotalAmount: (amount: number | null) => void,
    setCurrency: (currency: string | null) => void // ✅ Added this parameter
  ) => {
    try {
      const result = await recognizeText.recognize(uri);
      if (result && result.text) {
        console.log("Extracted Text:\n", result.text); // Debugging
        const total = extractTotal(result.text);
        const currency = extractCurrency(result.text);
        setTotalAmount(total);
        setCurrency(currency); // ✅ Now setting currency properly
        console.log(`Detected Currency: ${currency}, Total: ${total}`);
      } else {
        setTotalAmount(null);
        setCurrency(null);
      }
    } catch (error) {
      console.error("OCR Error:", error);
      setTotalAmount(null);
      setCurrency(null);
    }
  };
  

/**
 * Handles image selection and processing
 */
export const pickAndProcessImage = async (
setImageUri: (uri: string | null) => void, setTotalAmount: (amount: number | null) => void, setCurrency: (currency: string | null) => void) => {
  let result = await ImagePicker.launchImageLibrary({
    mediaType: 'photo',
    selectionLimit: 1,
    quality: 1,
  });

  if (!result.didCancel && result.assets && result.assets.length > 0) {
    const uri = result.assets[0].uri ?? null; // Fallback to null if undefined
    setImageUri(uri);
    if (uri) {
      await processImage(uri, setTotalAmount, setCurrency);
    }
  }
};
