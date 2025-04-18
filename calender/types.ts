export interface ExpenseItem {
    id: string;
    amount: number;
    source: string;
    date: string;
    category: string;
  }
  
  export interface SectionData {
    title: string;
    dbtotal: number;
    data: ExpenseItem[];
  }
  