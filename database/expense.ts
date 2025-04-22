import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export interface Expense {
    id: string;  
    amount: number;       // The amount of the expense (e.g., 50.75)
    source: string;       // The source of the expense (e.g., "Receipt")
    date: FirebaseFirestoreTypes.Timestamp; // The date the expense was recorded (Firestore Timestamp type)
    category: string;     // The category of the expense (e.g., "Food", "Travel")
  }
  