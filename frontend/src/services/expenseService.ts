
import { apiRequest } from './api';
import type { Expense, PaymentMethod } from '../types/expense';

interface ApiCategory {
  id: string;
  name: string;
  description?: string;
}

interface ApiExpense {
  id: string;
  title: string;
  description?: string | null;
  amount: number | string;
  categoryId: string;
  category: ApiCategory;
  date: string;
  paymentMethod: 'CASH' | 'CARD' | 'MOBILE' | 'BANK';
  notes?: string | null;
}

interface ExpenseResponse {
  message?: string;
  expense?: ApiExpense;
  expenses?: ApiExpense[];
}

const paymentMethodToApi: Record<PaymentMethod, ApiExpense['paymentMethod']> = {
  cash: 'CASH',
  card: 'CARD',
  mobile: 'MOBILE',
  bank: 'BANK',
};

const paymentMethodFromApi: Record<ApiExpense['paymentMethod'], PaymentMethod> = {
  CASH: 'cash',
  CARD: 'card',
  MOBILE: 'mobile',
  BANK: 'bank',
};

function normalizeExpense(expense: ApiExpense): Expense {
  return {
    id: expense.id,
    title: expense.title,
    description: expense.description ?? '',
    amount: Number(expense.amount),
    category: expense.category.name,
    categoryId: expense.categoryId,
    date: expense.date.slice(0, 10),
    paymentMethod: paymentMethodFromApi[expense.paymentMethod],
    notes: expense.notes ?? '',
  };
}


export async function getExpenses(token: string): Promise<Expense[]> {
  const expenses = await apiRequest<ApiExpense[]>('/expenses', {
    token,
  });

  return expenses.map(normalizeExpense);
}


export async function createExpense(
  token: string,
  expense: Omit<Expense, 'id'>
): Promise<Expense> {
  if (!expense.categoryId) {
    throw new Error('Please select a valid expense category.');
  }

  const response = await apiRequest<ExpenseResponse>('/expenses', {
    method: 'POST',
    token,
    body: JSON.stringify({
      title: expense.title,
      description: expense.description,
      amount: expense.amount,
      categoryId: expense.categoryId,
      date: expense.date,
      paymentMethod: paymentMethodToApi[expense.paymentMethod],
      notes: expense.notes,
    }),
  });

  if (!response.expense) {
    throw new Error('The server did not return the created expense.');
  }

  return normalizeExpense(response.expense);
}

export async function updateExpense(
  token: string,
  id: string,
  expense: Omit<Expense, 'id'>
): Promise<Expense> {
  if (!expense.categoryId) {
    throw new Error('Please select a valid expense category.');
  }

  const response = await apiRequest<ExpenseResponse>(`/expenses/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify({
      title: expense.title,
      description: expense.description,
      amount: expense.amount,
      categoryId: expense.categoryId,
      date: expense.date,
      paymentMethod: paymentMethodToApi[expense.paymentMethod],
      notes: expense.notes,
    }),
  });

  if (!response.expense) {
    throw new Error('The server did not return the updated expense.');
  }

  return normalizeExpense(response.expense);
}

export async function deleteExpense(
  token: string,
  id: string
): Promise<void> {
  await apiRequest<unknown>(`/expenses/${id}`, {
    method: 'DELETE',
    token,
  });
}
