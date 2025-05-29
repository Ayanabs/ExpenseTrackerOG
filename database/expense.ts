import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export interface Expense {
    id: string;  
    amount: number;       
    source: string;       
    date: FirebaseFirestoreTypes.Timestamp; 
    category: string;     
    userId:string;    
  }
  