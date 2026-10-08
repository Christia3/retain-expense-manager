import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import type { Category } from '../types/category';

interface CategoryState {
  categories: Category[];
}

const initialState: CategoryState = {
  categories: [
    {
      id: '1',
      name: 'Food',
      description: 'Restaurants, groceries, and meals',
    },
    {
      id: '2',
      name: 'Transport',
      description: 'Public transportation, fuel, and rides',
    },
    {
      id: '3',
      name: 'Housing',
      description: 'Rent, utilities, and home expenses',
    },
    {
      id: '4',
      name: 'Bills',
      description: 'Phone, internet, and other bills',
    },
    {
      id: '5',
      name: 'Entertainment',
      description: 'Movies, games, and leisure activities',
    },
    {
      id: '6',
      name: 'Health',
      description: 'Medical, pharmacy, and health expenses',
    },
    {
      id: '7',
      name: 'Other',
      description: 'Expenses that do not fit another category',
    },
  ],
};

const categorySlice = createSlice({
  name: 'categories',
  initialState,

  reducers: {
    addCategory: (
      state,
      action: PayloadAction<Category>
    ) => {
      state.categories.push(action.payload);
    },

    updateCategory: (
      state,
      action: PayloadAction<Category>
    ) => {
      const index = state.categories.findIndex(
        (category) =>
          category.id === action.payload.id
      );

      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },

    deleteCategory: (
      state,
      action: PayloadAction<string>
    ) => {
      state.categories = state.categories.filter(
        (category) =>
          category.id !== action.payload
      );
    },
  },
});

export const {
  addCategory,
  updateCategory,
  deleteCategory,
} = categorySlice.actions;

export default categorySlice.reducer;