
import { FormEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState, AppDispatch } from '../redux/store';
import {
  fetchBudget,
  saveBudget,
} from '../redux/budgetSlice';
import { fetchExpenses } from '../redux/expenseSlice';

function BudgetPage() {
  const dispatch = useDispatch<AppDispatch>();

  const monthlyBudget = useSelector(
    (state: RootState) => state.budget.monthlyBudget
  );

  const budgetRequestStatus = useSelector(
    (state: RootState) => state.budget.status
  );

  const budgetError = useSelector(
    (state: RootState) => state.budget.error
  );

  const expenseStatus = useSelector(
    (state: RootState) => state.expenses.status
  );

  const expenses = useSelector(
    (state: RootState) => state.expenses.expenses
  );

  const [budgetInput, setBudgetInput] = useState(
    String(monthlyBudget)
  );

  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load the saved budget and expenses when the page opens.
  useEffect(() => {
    if (budgetRequestStatus === 'idle') {
      dispatch(fetchBudget());
    }

    if (expenseStatus === 'idle') {
      dispatch(fetchExpenses());
    }
  }, [
    dispatch,
    budgetRequestStatus,
    expenseStatus,
  ]);

  // Keep the input synchronized with the loaded or saved budget.
  useEffect(() => {
    setBudgetInput(String(monthlyBudget));
  }, [monthlyBudget]);

  // Calculate spending for the current month.
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const totalSpent = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);

      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    })
    .reduce(
      (total, expense) => total + expense.amount,
      0
    );

  const remainingBudget = monthlyBudget - totalSpent;

  let budgetStatus = 'Within Budget';

  if (monthlyBudget <= 0) {
    budgetStatus = 'No Budget Set';
  } else if (remainingBudget < 0) {
    budgetStatus = 'Over Budget';
  } else if (remainingBudget <= monthlyBudget * 0.2) {
    budgetStatus = 'Approaching Limit';
  }

  const spendingPercentage =
    monthlyBudget > 0
      ? Math.min((totalSpent / monthlyBudget) * 100, 100)
      : 0;

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setFormError('');
    setSuccessMessage('');

    const newBudget = Number(budgetInput);

    if (
      budgetInput.trim() === '' ||
      !Number.isFinite(newBudget) ||
      newBudget <= 0
    ) {
      setFormError('Please enter a valid budget greater than zero.');
      return;
    }

    try {
      await dispatch(saveBudget(newBudget)).unwrap();
      setSuccessMessage('Your monthly budget has been saved successfully.');
    } catch (error) {
      setFormError(
        typeof error === 'string'
          ? error
          : 'Failed to save your budget. Please try again.'
      );
    }
  };

  const isLoading = budgetRequestStatus === 'loading';

  return (
    <div className="budget-page">
      <header className="page-header">
        <div>
          <h1>Monthly Budget</h1>
          <p>Manage your monthly spending budget.</p>
        </div>
      </header>

      {budgetRequestStatus === 'failed' && budgetError && (
        <p role="alert">
          Could not load your budget: {budgetError}
        </p>
      )}

      {/* Budget Summary */}
      <div className="budget-summary-grid">
        <div className="budget-summary-card">
          <span>Monthly Budget</span>
          <h2>${monthlyBudget.toFixed(2)}</h2>
        </div>

        <div className="budget-summary-card">
          <span>Total Spent</span>
          <h2>${totalSpent.toFixed(2)}</h2>
        </div>

        <div className="budget-summary-card">
          <span>Remaining Budget</span>
          <h2
            className={
              remainingBudget < 0 ? 'negative-amount' : ''
            }
          >
            ${remainingBudget.toFixed(2)}
          </h2>
        </div>

        <div className="budget-summary-card">
          <span>Status</span>
          <h2>{budgetStatus}</h2>
        </div>
      </div>

      {/* Update Budget */}
      <div className="budget-card">
        <div className="budget-card-header">
          <h2>Update Monthly Budget</h2>
          <p>Set the amount you want to spend each month.</p>
        </div>

        <form className="budget-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="monthlyBudget">
              Monthly Budget
            </label>

            <input
              id="monthlyBudget"
              type="number"
              min="0.01"
              step="0.01"
              value={budgetInput}
              onChange={(event) => {
                setBudgetInput(event.target.value);
                setFormError('');
                setSuccessMessage('');
              }}
              required
            />
          </div>

          {formError && (
            <p role="alert">{formError}</p>
          )}

          {successMessage && (
            <p role="status">{successMessage}</p>
          )}

          <button
            type="submit"
            className="save-expense-button"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Update Budget'}
          </button>
        </form>
      </div>

      {/* Spending Progress */}
      <div className="budget-card">
        <div className="budget-card-header">
          <h2>Budget Progress</h2>
          <p>Your spending for the current month.</p>
        </div>

        <div className="budget-progress">
          <div className="budget-progress-header">
            <span>${totalSpent.toFixed(2)} spent</span>
            <span>${monthlyBudget.toFixed(2)} budget</span>
          </div>

          <div
            className="budget-progress-bar"
            role="progressbar"
            aria-label="Monthly budget spending progress"
            aria-valuenow={spendingPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={`budget-progress-fill ${
                remainingBudget < 0 ? 'over-budget' : ''
              }`}
              style={{ width: `${spendingPercentage}%` }}
            />
          </div>

          <p>
            {monthlyBudget > 0
              ? `${((totalSpent / monthlyBudget) * 100).toFixed(1)}% of your budget used`
              : 'Set a budget to track your spending progress.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default BudgetPage;
