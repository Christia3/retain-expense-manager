import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState, AppDispatch } from '../redux/store';

import { fetchExpenses } from '../redux/expenseSlice';
import { fetchBudget } from '../redux/budgetSlice';

function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();

  // Get expenses from Redux.
  const expenses = useSelector(
    (state: RootState) => state.expenses.expenses
  );

  const expenseStatus = useSelector(
    (state: RootState) => state.expenses.status
  );

  const expenseError = useSelector(
    (state: RootState) => state.expenses.error
  );

  // Get the monthly budget from Redux.
  const monthlyBudget = useSelector(
    (state: RootState) => state.budget.monthlyBudget
  );

  const budgetStatus = useSelector(
    (state: RootState) => state.budget.status
  );

  const budgetError = useSelector(
    (state: RootState) => state.budget.error
  );

  // Load expenses and the current month's budget.
  useEffect(() => {
    if (expenseStatus === 'idle') {
      dispatch(fetchExpenses());
    }

    if (budgetStatus === 'idle') {
      dispatch(fetchBudget());
    }
  }, [dispatch, expenseStatus, budgetStatus]);

  // Get the current month and year.
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Keep only expenses from the current month.
  const currentMonthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(
      `${expense.date.slice(0, 10)}T00:00:00`
    );

    return (
      expenseDate.getMonth() === currentMonth &&
      expenseDate.getFullYear() === currentYear
    );
  });

  // Calculate total spending for the current month.
  const totalSpent = currentMonthExpenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  // Calculate the remaining budget.
  const remainingBudget = monthlyBudget - totalSpent;

  // Find the highest individual expense.
  const highestExpense =
    currentMonthExpenses.length > 0
      ? currentMonthExpenses.reduce((highest, expense) =>
          expense.amount > highest.amount ? expense : highest
        )
      : null;

  // Calculate spending by category.
  const categoryTotals = currentMonthExpenses.reduce<
    Record<string, number>
  >((totals, expense) => {
    totals[expense.category] =
      (totals[expense.category] || 0) + expense.amount;

    return totals;
  }, {});

  // Get the five most recent expenses.
  const recentExpenses = [...currentMonthExpenses]
    .sort((a, b) => {
      return (
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
      );
    })
    .slice(0, 5);

  // Format currency consistently.
  const formatCurrency = (amount: number) =>
    amount.toLocaleString('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Format dates for display.
  const formatDate = (date: string) =>
    new Date(`${date.slice(0, 10)}T00:00:00`).toLocaleDateString(
      'en-CA',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }
    );

  // Show a loading screen while expenses are loading.
  if (expenseStatus === 'loading' && expenses.length === 0) {
    return (
      <div className="dashboard-page">
        <h1>Loading your dashboard...</h1>
      </div>
    );
  }

  // Show an error if expenses could not be loaded.
  if (expenseStatus === 'failed' && expenses.length === 0) {
    return (
      <div className="dashboard-page">
        <h1>Unable to load your dashboard</h1>
        <p>{expenseError}</p>

        <button
          type="button"
          onClick={() => dispatch(fetchExpenses())}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Page header */}
      <header className="page-header">
        <div>
          <h1>Welcome back! 👋</h1>
          <p>Here's an overview of your spending.</p>
        </div>

        <Link to="/expenses/add" className="primary-button">
          + Add Expense
        </Link>
      </header>

      {/* Summary cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <span>Total Spent</span>
          <h2>{formatCurrency(totalSpent)}</h2>
          <p>This month</p>
        </div>

        <div className="summary-card">
          <span>Monthly Budget</span>

          <h2>
            {budgetStatus === 'loading'
              ? 'Loading...'
              : formatCurrency(monthlyBudget)}
          </h2>

          <p>
            {budgetStatus === 'failed'
              ? 'Unable to load budget'
              : monthlyBudget > 0
                ? 'Current budget'
                : 'No budget set'}
          </p>

          {budgetError && (
            <small role="alert">{budgetError}</small>
          )}
        </div>

        <div className="summary-card">
          <span>Remaining</span>

          <h2
            className={
              remainingBudget < 0 ? 'negative-amount' : ''
            }
          >
            {formatCurrency(remainingBudget)}
          </h2>

          <p>
            {monthlyBudget <= 0
              ? 'Set a monthly budget'
              : remainingBudget < 0
                ? 'Over budget'
                : 'Available'}
          </p>
        </div>

        <div className="summary-card">
          <span>Highest Expense</span>

          <h2>
            {formatCurrency(highestExpense?.amount ?? 0)}
          </h2>

          <p>{highestExpense?.title ?? 'No expenses yet'}</p>
        </div>
      </div>

      {/* Category spending and recent expenses */}
      <div className="dashboard-grid">
        {/* Spending by category */}
        <section className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Spending by Category</h2>
              <p>Your spending this month</p>
            </div>
          </div>

          {Object.keys(categoryTotals).length === 0 ? (
            <div className="empty-dashboard">
              <p>No expenses recorded this month.</p>
            </div>
          ) : (
            <div className="category-list">
              {Object.entries(categoryTotals)
                .sort(
                  ([, amountA], [, amountB]) =>
                    amountB - amountA
                )
                .map(([category, amount]) => {
                  const percentage =
                    totalSpent > 0
                      ? (amount / totalSpent) * 100
                      : 0;

                  return (
                    <div
                      className="category-item"
                      key={category}
                    >
                      <div className="category-info">
                        <span>{category}</span>
                        <span>{formatCurrency(amount)}</span>
                      </div>

                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </section>

        {/* Recent expenses */}
        <section className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Recent Expenses</h2>
              <p>Your latest transactions</p>
            </div>

            <Link
  to={
    localStorage.getItem('retain_user') &&
    JSON.parse(localStorage.getItem('retain_user') || '{}').role === 'ADMIN'
      ? '/admin/expenses'
      : '/expenses'
  }
>
  View all
</Link>
          </div>

          {recentExpenses.length === 0 ? (
            <div className="empty-dashboard">
              <p>No expenses recorded this month.</p>
            </div>
          ) : (
            <div className="recent-expenses">
              {recentExpenses.map((expense) => (
                <div
                  className="recent-expense-item"
                  key={expense.id}
                >
                  <div className="recent-expense-details">
                    <strong>{expense.title}</strong>
                    <span>{expense.category}</span>
                  </div>

                  <div className="recent-expense-meta">
                    <strong>
                      {formatCurrency(expense.amount)}
                    </strong>
                    <span>{formatDate(expense.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default DashboardPage;
