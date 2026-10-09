
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Expense } from '../types/expense';
import * as expenseService from '../services/expenseService';

type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface ExpenseState {
  expenses: Expense[];

  searchTerm: string;
  categoryFilter: string;
  paymentMethodFilter: string;
  sortBy: 'date' | 'amount' | 'title';
  sortOrder: 'asc' | 'desc';

  status: RequestStatus;
  error: string | null;
}

const initialState: ExpenseState = {
  expenses: [],

  searchTerm: '',
  categoryFilter: '',
  paymentMethodFilter: '',

  sortBy: 'date',
  sortOrder: 'desc',

  status: 'idle',
  error: null,
};

// Get the login token saved by AuthContext.
function getToken(): string {
  const token = localStorage.getItem('retain_token');

  if (!token) {
    throw new Error('Please sign in to manage your expenses.');
  }

  return token;
}

// Fetch expenses from the backend.
export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async () => {
    return expenseService.getExpenses(getToken());
  }
);

// Create an expense in the database.
export const createExpenseThunk = createAsyncThunk(
  'expenses/createExpense',
  async (expense: Omit<Expense, 'id'>) => {
    return expenseService.createExpense(getToken(), expense);
  }
);

// Update an existing database expense.
export const updateExpenseThunk = createAsyncThunk(
  'expenses/updateExpense',
  async (expense: Expense) => {
    const { id, ...expenseData } = expense;

    return expenseService.updateExpense(
      getToken(),
      id,
      expenseData
    );
  }
);

// Delete an expense from the database.
export const deleteExpenseThunk = createAsyncThunk(
  'expenses/deleteExpense',
  async (id: string) => {
    await expenseService.deleteExpense(getToken(), id);
    return id;
  }
);

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,

  reducers: {
    // These synchronous reducers remain available for existing components.
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

    clearExpenseError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch expenses
      .addCase(fetchExpenses.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.expenses = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          action.error.message ?? 'Unable to load expenses.';
      })

      // Create expense
      .addCase(createExpenseThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(createExpenseThunk.fulfilled, (state, action) => {
        state.expenses.push(action.payload);
        state.status = 'succeeded';
      })
      .addCase(createExpenseThunk.rejected, (state, action) => {
        state.error =
          action.error.message ?? 'Unable to create expense.';
      })

      // Update expense
      .addCase(updateExpenseThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(updateExpenseThunk.fulfilled, (state, action) => {
        const index = state.expenses.findIndex(
          (expense) => expense.id === action.payload.id
        );

        if (index !== -1) {
          state.expenses[index] = action.payload;
        }

        state.status = 'succeeded';
      })
      .addCase(updateExpenseThunk.rejected, (state, action) => {
        state.error =
          action.error.message ?? 'Unable to update expense.';
      })

      // Delete expense
      .addCase(deleteExpenseThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteExpenseThunk.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter(
          (expense) => expense.id !== action.payload
        );

        state.status = 'succeeded';
      })
      .addCase(deleteExpenseThunk.rejected, (state, action) => {
        state.error =
          action.error.message ?? 'Unable to delete expense.';
      });
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
  clearExpenseError,
} = expenseSlice.actions;

export default expenseSlice.reducer;
