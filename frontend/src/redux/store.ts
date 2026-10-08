import { configureStore } from '@reduxjs/toolkit';

import expenseReducer from './expenseSlice';
import budgetReducer from './budgetSlice';
import categoryReducer from './categorySlice';

export const store = configureStore({
  reducer: {
    expenses: expenseReducer,
    budget: budgetReducer,
    categories: categoryReducer,
  },
});

export type RootState = ReturnType<
  typeof store.getState
>;

export type AppDispatch = typeof store.dispatch;