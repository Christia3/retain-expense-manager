
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { apiRequest } from '../services/api';

interface BudgetResponse {
  month?: string;
  budget?: number | string | { amount: number | string };
  amount?: number | string;
  totalSpent?: number | string;
  remaining?: number | string;
  status?: 'WITHIN' | 'APPROACHING' | 'OVER';
  message?: string;
}

interface BudgetState {
  monthlyBudget: number;
  totalSpent: number;
  remaining: number;
  budgetStatus: 'WITHIN' | 'APPROACHING' | 'OVER';
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: BudgetState = {
  monthlyBudget: 0,
  totalSpent: 0,
  remaining: 0,
  budgetStatus: 'WITHIN',
  status: 'idle',
  error: null,
};

function getToken(): string {
  const token = localStorage.getItem('retain_token');

  if (!token) {
    throw new Error('Please sign in to manage your budget.');
  }

  return token;
}

function getCurrentMonth(): string {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, '0')}`;
}

function getBudgetAmount(data: BudgetResponse): number {
  if (typeof data.budget === 'object' && data.budget !== null) {
    return Number(data.budget.amount) || 0;
  }

  return Number(data.budget ?? data.amount ?? 0) || 0;
}

function applyBudgetResponse(
  state: BudgetState,
  data: BudgetResponse
) {
  state.monthlyBudget = getBudgetAmount(data);
  state.totalSpent = Number(data.totalSpent ?? 0) || 0;
  state.remaining = Number(data.remaining ?? 0) || 0;
  state.budgetStatus = data.status ?? 'WITHIN';
}

export const fetchBudget = createAsyncThunk(
  'budget/fetchBudget',
  async (month: string = getCurrentMonth()) => {
    return apiRequest<BudgetResponse>(
      `/budget?month=${month}`,
      { token: getToken() }
    );
  }
);

export const saveBudget = createAsyncThunk(
  'budget/saveBudget',
  async (amount: number) => {
    const response = await apiRequest<BudgetResponse>(
      '/budget',
      {
        method: 'PUT',
        token: getToken(),
        body: JSON.stringify({
          month: getCurrentMonth(),
          amount,
        }),
      }
    );

    // The save endpoint returns { message, budget }.
    // Fetch the calculated spending and remaining amount afterward.
    const updatedBudget = await apiRequest<BudgetResponse>(
      `/budget?month=${getCurrentMonth()}`,
      { token: getToken() }
    );

    return {
      ...updatedBudget,
      budget: updatedBudget.budget ?? response.budget,
    };
  }
);

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    setMonthlyBudget: (state, action: PayloadAction<number>) => {
      state.monthlyBudget = action.payload;
      state.remaining = state.monthlyBudget - state.totalSpent;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudget.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchBudget.fulfilled, (state, action) => {
        applyBudgetResponse(state, action.payload);
        state.status = 'succeeded';
      })
      .addCase(fetchBudget.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          action.error.message ?? 'Failed to load your budget.';
      })
      .addCase(saveBudget.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(saveBudget.fulfilled, (state, action) => {
        applyBudgetResponse(state, action.payload);
        state.status = 'succeeded';
      })
      .addCase(saveBudget.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          action.error.message ?? 'Failed to save your budget.';
      });
  },
});

export const { setMonthlyBudget } = budgetSlice.actions;

export default budgetSlice.reducer;
