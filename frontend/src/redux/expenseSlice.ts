import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Expense } from '../types/expense';

interface ExpenseState {
  expenses: Expense[];

  searchTerm: string;
  categoryFilter: string;
  paymentMethodFilter: string;
  sortBy: 'date' | 'amount' | 'title';
  sortOrder: 'asc' | 'desc';
}

const initialState: ExpenseState = {
  expenses: [],

  searchTerm: '',
  categoryFilter: '',
  paymentMethodFilter: '',

  sortBy: 'date',
  sortOrder: 'desc',
};

const expenseSlice = createSlice({
  name: 'expenses',

  initialState,

  reducers: {
    addExpense: (state, action: PayloadAction<Expense>) => {
      state.expenses.push(action.payload);
    },

    deleteExpense: (state, action: PayloadAction<string>) => {
      state.expenses = state.expenses.filter(
        (expense) => expense.id !== action.payload
      );
    },

    updateExpense: (state, action: PayloadAction<Expense>) => {
      const index = state.expenses.findIndex(
        (expense) => expense.id === action.payload.id
      );

      if (index !== -1) {
        state.expenses[index] = action.payload;
      }
    },

    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },

    setCategoryFilter: (state, action: PayloadAction<string>) => {
      state.categoryFilter = action.payload;
    },

    setPaymentMethodFilter: (
      state,
      action: PayloadAction<string>
    ) => {
      state.paymentMethodFilter = action.payload;
    },

    setSortBy: (
      state,
      action: PayloadAction<'date' | 'amount' | 'title'>
    ) => {
      state.sortBy = action.payload;
    },

    setSortOrder: (
      state,
      action: PayloadAction<'asc' | 'desc'>
    ) => {
      state.sortOrder = action.payload;
    },

    clearFilters: (state) => {
      state.searchTerm = '';
      state.categoryFilter = '';
      state.paymentMethodFilter = '';
      state.sortBy = 'date';
      state.sortOrder = 'desc';
    },
  },
});

export const {
  addExpense,
  deleteExpense,
  updateExpense,
  setSearchTerm,
  setCategoryFilter,
  setPaymentMethodFilter,
  setSortBy,
  setSortOrder,
  clearFilters,
} = expenseSlice.actions;

export default expenseSlice.reducer;