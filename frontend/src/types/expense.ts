
export type ExpenseCategory = string;

export type PaymentMethod = 'cash' | 'card' | 'mobile' | 'bank';

export interface Expense {
  id: string;
  title: string;
  description?: string;
  amount: number;

  // The category name is displayed in the UI.
  category: ExpenseCategory;

  // The category ID is used when communicating with the backend.
  categoryId?: string;

  date: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}
