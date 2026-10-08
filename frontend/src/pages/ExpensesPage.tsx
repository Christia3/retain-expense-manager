import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../redux/store';

import {
  deleteExpense,
  setSearchTerm,
  setCategoryFilter,
  setPaymentMethodFilter,
  setSortBy,
  setSortOrder,
  clearFilters,
} from '../redux/expenseSlice';

import { selectFilteredExpenses } from '../redux/expenseSelectors';

function ExpensesPage() {
  const dispatch = useDispatch();

  const expenses = useSelector(
    selectFilteredExpenses
  );

  const categories = useSelector(
    (state: RootState) =>
      state.categories.categories
  );

  const {
    searchTerm,
    categoryFilter,
    paymentMethodFilter,
    sortBy,
    sortOrder,
  } = useSelector(
    (state: RootState) => state.expenses
  );

  const totalExpenses = useSelector(
    (state: RootState) =>
      state.expenses.expenses.length
  );

  /*
   * PAGINATION
   */

  const expensesPerPage = 5;

  const [currentPage, setCurrentPage] =
    useState(1);

  const totalPages = Math.ceil(
    expenses.length / expensesPerPage
  );

  const startIndex =
    (currentPage - 1) * expensesPerPage;

  const endIndex =
    startIndex + expensesPerPage;

  const currentExpenses = expenses.slice(
    startIndex,
    endIndex
  );

  /*
   * Reset to page 1 whenever the
   * search/filter results change.
   */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    categoryFilter,
    paymentMethodFilter,
    sortBy,
    sortOrder,
  ]);

  /*
   * Delete expense
   */

  const handleDelete = (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this expense?'
    );

    if (confirmed) {
      dispatch(deleteExpense(id));
    }
  };

  /*
   * Go to previous page
   */

  const handlePreviousPage = () => {
    setCurrentPage((page) =>
      Math.max(page - 1, 1)
    );
  };

  /*
   * Go to next page
   */

  const handleNextPage = () => {
    setCurrentPage((page) =>
      Math.min(page + 1, totalPages)
    );
  };

  return (
    <div className="expenses-page">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <header className="page-header">

        <div>
          <h1>Expenses</h1>

          <p>
            Manage and track your personal
            expenses.
          </p>
        </div>

        <Link
          to="/expenses/add"
          className="primary-button"
        >
          + Add Expense
        </Link>

      </header>

      {/* =========================
          FILTERS
      ========================= */}

      <div className="filters-card">

        {/* SEARCH */}

        <div className="search-box">

          <label htmlFor="search">
            Search expenses
          </label>

          <input
            id="search"
            type="text"
            placeholder="Search by expense title..."
            value={searchTerm}
            onChange={(event) =>
              dispatch(
                setSearchTerm(
                  event.target.value
                )
              )
            }
          />

        </div>

        {/* CATEGORY FILTER */}

        <div className="filter-group">

          <label htmlFor="categoryFilter">
            Category
          </label>

          <select
            id="categoryFilter"
            value={categoryFilter}
            onChange={(event) =>
              dispatch(
                setCategoryFilter(
                  event.target.value
                )
              )
            }
          >

            <option value="">
              All Categories
            </option>

            {categories.map(
              (category) => (
                <option
                  key={category.id}
                  value={category.name}
                >
                  {category.name}
                </option>
              )
            )}

          </select>

        </div>

        {/* PAYMENT FILTER */}

        <div className="filter-group">

          <label htmlFor="paymentFilter">
            Payment Method
          </label>

          <select
            id="paymentFilter"
            value={paymentMethodFilter}
            onChange={(event) =>
              dispatch(
                setPaymentMethodFilter(
                  event.target.value
                )
              )
            }
          >

            <option value="">
              All Payment Methods
            </option>

            <option value="cash">
              Cash
            </option>

            <option value="card">
              Credit/Debit Card
            </option>

            <option value="mobile">
              Mobile Money
            </option>

            <option value="bank">
              Bank Transfer
            </option>

          </select>

        </div>

        {/* SORT BY */}

        <div className="filter-group">

          <label htmlFor="sortBy">
            Sort By
          </label>

          <select
            id="sortBy"
            value={sortBy}
            onChange={(event) =>
              dispatch(
                setSortBy(
                  event.target.value as
                    | 'date'
                    | 'amount'
                    | 'title'
                )
              )
            }
          >

            <option value="date">
              Date
            </option>

            <option value="amount">
              Amount
            </option>

            <option value="title">
              Title
            </option>

          </select>

        </div>

        {/* SORT ORDER */}

        <div className="filter-group">

          <label htmlFor="sortOrder">
            Order
          </label>

          <select
            id="sortOrder"
            value={sortOrder}
            onChange={(event) =>
              dispatch(
                setSortOrder(
                  event.target.value as
                    | 'asc'
                    | 'desc'
                )
              )
            }
          >

            <option value="desc">
              Descending
            </option>

            <option value="asc">
              Ascending
            </option>

          </select>

        </div>

        {/* CLEAR FILTERS */}

        <button
          type="button"
          className="clear-filters-button"
          onClick={() =>
            dispatch(clearFilters())
          }
        >
          Clear Filters
        </button>

      </div>

      {/* =========================
          EXPENSE TABLE
      ========================= */}

      <div className="expenses-card">

        <div className="expenses-card-header">

          <div>

            <h2>
              All Expenses
            </h2>

            <span>
              Showing{' '}
              {expenses.length === 0
                ? 0
                : startIndex + 1}
              {' - '}
              {Math.min(
                endIndex,
                expenses.length
              )}{' '}
              of {expenses.length}{' '}
              matching expenses
            </span>

          </div>

        </div>

        {expenses.length === 0 ? (

          /* EMPTY STATE */

          <div className="empty-state">

            <h3>
              {totalExpenses === 0
                ? 'No expenses yet'
                : 'No matching expenses'}
            </h3>

            <p>
              {totalExpenses === 0
                ? 'Add your first expense to start tracking your spending.'
                : 'Try changing your search or filters.'}
            </p>

            {totalExpenses === 0 && (
              <Link
                to="/expenses/add"
                className="primary-button"
              >
                Add Your First Expense
              </Link>
            )}

          </div>

        ) : (

          <>

            {/* TABLE */}

            <div className="table-container">

              <table className="expenses-table">

                <thead>

                  <tr>

                    <th>
                      Expense
                    </th>

                    <th>
                      Category
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Payment Method
                    </th>

                    <th>
                      Amount
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {currentExpenses.map(
                    (expense) => (

                      <tr
                        key={expense.id}
                      >

                        <td>

                          <div className="expense-name">
                            {expense.title}
                          </div>

                          {expense.notes && (
                            <small>
                              {expense.notes}
                            </small>
                          )}

                        </td>

                        <td>
                          {expense.category}
                        </td>

                        <td>
                          {expense.date}
                        </td>

                        <td>
                          {expense.paymentMethod}
                        </td>

                        <td className="expense-amount">
                          $
                          {expense.amount.toFixed(
                            2
                          )}
                        </td>

                        <td>

                          <div className="action-buttons">

                            <Link
                              to={`/expenses/edit/${expense.id}`}
                              className="edit-button"
                            >
                              Edit
                            </Link>

                            <button
                              type="button"
                              className="delete-button"
                              onClick={() =>
                                handleDelete(
                                  expense.id
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

            {/* =========================
                PAGINATION
            ========================= */}

            {totalPages > 1 && (

              <div className="pagination">

                <button
                  type="button"
                  className="pagination-button"
                  onClick={
                    handlePreviousPage
                  }
                  disabled={
                    currentPage === 1
                  }
                >
                  ← Previous
                </button>

                <div className="pagination-info">

                  <span>
                    Page {currentPage} of{' '}
                    {totalPages}
                  </span>

                </div>

                <button
                  type="button"
                  className="pagination-button"
                  onClick={
                    handleNextPage
                  }
                  disabled={
                    currentPage ===
                    totalPages
                  }
                >
                  Next →
                </button>

              </div>

            )}

          </>

        )}

      </div>

    </div>
  );
}

export default ExpensesPage;