import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface BudgetState {
  monthlyBudget: number;
}

const initialState: BudgetState = {
  monthlyBudget: 2000,
};

const budgetSlice = createSlice({
  name: 'budget',
  initialState,

  reducers: {
    setMonthlyBudget: (
      state,
      action: PayloadAction<number>
    ) => {
      state.monthlyBudget = action.payload;
    },
  },
});

export const { setMonthlyBudget } =
  budgetSlice.actions;

export default budgetSlice.reducer;