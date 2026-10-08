export type ExpenseCategory = string;

export type PaymentMethod =
  | 'cash'
  | 'card'
  | 'mobile'
  | 'bank';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}