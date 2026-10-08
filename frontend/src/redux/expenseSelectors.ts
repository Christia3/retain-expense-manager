import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './store';

const selectExpenses = (state: RootState) =>
  state.expenses.expenses;

const selectSearchTerm = (state: RootState) =>
  state.expenses.searchTerm;

const selectCategoryFilter = (state: RootState) =>
  state.expenses.categoryFilter;

const selectPaymentMethodFilter = (state: RootState) =>
  state.expenses.paymentMethodFilter;

const selectSortBy = (state: RootState) =>
  state.expenses.sortBy;

const selectSortOrder = (state: RootState) =>
  state.expenses.sortOrder;

export const selectFilteredExpenses = createSelector(
  [
    selectExpenses,
    selectSearchTerm,
    selectCategoryFilter,
    selectPaymentMethodFilter,
    selectSortBy,
    selectSortOrder,
  ],

  (
    expenses,
    searchTerm,
    categoryFilter,
    paymentMethodFilter,
    sortBy,
    sortOrder
  ) => {
    let filteredExpenses = [...expenses];

    // Search by title
    if (searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase();

      filteredExpenses = filteredExpenses.filter(
        (expense) =>
          expense.title.toLowerCase().includes(search)
      );
    }

    // Filter by category
    if (categoryFilter !== '') {
      filteredExpenses = filteredExpenses.filter(
        (expense) =>
          expense.category === categoryFilter
      );
    }

    // Filter by payment method
    if (paymentMethodFilter !== '') {
      filteredExpenses = filteredExpenses.filter(
        (expense) =>
          expense.paymentMethod === paymentMethodFilter
      );
    }

    // Sort expenses
    filteredExpenses.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'amount') {
        comparison = a.amount - b.amount;
      }

      if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      }

      if (sortBy === 'date') {
        comparison = a.date.localeCompare(b.date);
      }

      return sortOrder === 'asc'
        ? comparison
        : -comparison;
    });

    return filteredExpenses;
  }
);