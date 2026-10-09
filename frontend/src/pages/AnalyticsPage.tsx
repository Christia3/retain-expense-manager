
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState, AppDispatch } from '../redux/store';
import { fetchExpenses } from '../redux/expenseSlice';
import { fetchCategories } from '../redux/categorySlice';

function AnalyticsPage() {
  const dispatch = useDispatch<AppDispatch>();

  const expenses = useSelector(
    (state: RootState) => state.expenses.expenses
  );

  const expenseStatus = useSelector(
    (state: RootState) => state.expenses.status
  );

  const expenseError = useSelector(
    (state: RootState) => state.expenses.error
  );

  const categories = useSelector(
    (state: RootState) => state.categories.categories
  );

  const categoryStatus = useSelector(
    (state: RootState) => state.categories.status
  );

  const categoryError = useSelector(
    (state: RootState) => state.categories.error
  );

  useEffect(() => {
    if (expenseStatus === 'idle') {
      dispatch(fetchExpenses());
    }

    if (categoryStatus === 'idle') {
      dispatch(fetchCategories());
    }
  }, [
    dispatch,
    expenseStatus,
    categoryStatus,
  ]);

  const analytics = useMemo(() => {
    const totalSpending = expenses.reduce(
      (total, expense) => total + expense.amount,
      0
    );

    const expenseCount = expenses.length;

    const averageExpense =
      expenseCount > 0 ? totalSpending / expenseCount : 0;

    const highestExpense =
      expenses.length > 0
        ? expenses.reduce((highest, expense) =>
            expense.amount > highest.amount ? expense : highest
          )
        : null;

    const categoryTotals = expenses.reduce<
      Record<string, number>
    >((totals, expense) => {
      totals[expense.category] =
        (totals[expense.category] || 0) + expense.amount;

      return totals;
    }, {});

    const sortedCategories = Object.entries(
      categoryTotals
    ).sort(([, amountA], [, amountB]) => amountB - amountA);

    const paymentTotals = expenses.reduce<
      Record<string, number>
    >((totals, expense) => {
      totals[expense.paymentMethod] =
        (totals[expense.paymentMethod] || 0) +
        expense.amount;

      return totals;
    }, {});

    const currentDate = new Date();

    const currentMonthExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);

      return (
        expenseDate.getMonth() === currentDate.getMonth() &&
        expenseDate.getFullYear() === currentDate.getFullYear()
      );
    });

    const currentMonthSpending = currentMonthExpenses.reduce(
      (total, expense) => total + expense.amount,
      0
    );

    return {
      totalSpending,
      expenseCount,
      averageExpense,
      highestExpense,
      sortedCategories,
      paymentTotals,
      currentMonthSpending,
    };
  }, [expenses]);

  const maximumCategoryAmount =
    analytics.sortedCategories.length > 0
      ? analytics.sortedCategories[0][1]
      : 0;

  const isLoading =
    expenseStatus === 'loading' ||
    categoryStatus === 'loading';

  if (isLoading && expenseStatus !== 'succeeded') {
    return (
      <div className="analytics-page">
        <header className="page-header">
          <div>
            <h1>Analytics</h1>
            <p>Loading your spending insights...</p>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <header className="page-header">
        <div>
          <h1>Analytics</h1>
          <p>
            Understand your spending patterns and financial activity.
          </p>
        </div>
      </header>

      {expenseStatus === 'failed' && (
        <p role="alert">
          Could not load expenses: {expenseError}
        </p>
      )}

      {categoryStatus === 'failed' && (
        <p role="alert">
          Could not load categories: {categoryError}
        </p>
      )}

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <span>Total Spending</span>
          <h2>${analytics.totalSpending.toFixed(2)}</h2>
          <p>Across all expenses</p>
        </div>

        <div className="summary-card">
          <span>Total Expenses</span>
          <h2>{analytics.expenseCount}</h2>
          <p>Recorded transactions</p>
        </div>

        <div className="summary-card">
          <span>Average Expense</span>
          <h2>${analytics.averageExpense.toFixed(2)}</h2>
          <p>Average per transaction</p>
        </div>

        <div className="summary-card">
          <span>This Month</span>
          <h2>${analytics.currentMonthSpending.toFixed(2)}</h2>
          <p>Current month spending</p>
        </div>
      </div>

      {/* Highest Expense */}
      {analytics.highestExpense && (
        <section className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Highest Expense</h2>
              <p>Your largest recorded transaction.</p>
            </div>
          </div>

          <div className="analytics-highlight">
            <div>
              <strong>{analytics.highestExpense.title}</strong>
              <span>
                {analytics.highestExpense.category}
                {' • '}
                {analytics.highestExpense.date}
              </span>
            </div>

            <strong className="analytics-highlight-amount">
              ${analytics.highestExpense.amount.toFixed(2)}
            </strong>
          </div>
        </section>
      )}

      {/* Spending by Category */}
      <section className="dashboard-card">
        <div className="card-header">
          <div>
            <h2>Spending by Category</h2>
            <p>See where most of your money is going.</p>
          </div>
        </div>

        {analytics.sortedCategories.length === 0 ? (
          <div className="empty-state">
            <h3>No spending data yet</h3>
            <p>Add expenses to see your spending breakdown.</p>
          </div>
        ) : (
          <div className="analytics-category-list">
            {analytics.sortedCategories.map(([category, amount]) => {
              const percentage =
                analytics.totalSpending > 0
                  ? (amount / analytics.totalSpending) * 100
                  : 0;

              const barWidth =
                maximumCategoryAmount > 0
                  ? (amount / maximumCategoryAmount) * 100
                  : 0;

              const categoryInfo = categories.find(
                (item) => item.name === category
              );

              return (
                <div
                  className="analytics-category"
                  key={category}
                >
                  <div className="analytics-category-header">
                    <div>
                      <strong>{category}</strong>
                      {categoryInfo?.description && (
                        <span>{categoryInfo.description}</span>
                      )}
                    </div>

                    <div className="analytics-category-values">
                      <strong>${amount.toFixed(2)}</strong>
                      <span>{percentage.toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="analytics-bar-background">
                    <div
                      className="analytics-bar"
                      style={{ width: `${barWidth}%` }}
                      role="progressbar"
                      aria-label={`${category} spending compared with the highest-spending category`}
                      aria-valuenow={Math.round(barWidth)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Spending by Payment Method */}
      <section className="dashboard-card">
        <div className="card-header">
          <div>
            <h2>Spending by Payment Method</h2>
            <p>See how you pay for your expenses.</p>
          </div>
        </div>

        {Object.keys(analytics.paymentTotals).length === 0 ? (
          <div className="empty-state">
            <h3>No payment data yet</h3>
            <p>
              Add expenses to see your payment method breakdown.
            </p>
          </div>
        ) : (
          <div className="analytics-payment-grid">
            {Object.entries(analytics.paymentTotals).map(
              ([method, amount]) => {
                const percentage =
                  analytics.totalSpending > 0
                    ? (amount / analytics.totalSpending) * 100
                    : 0;

                return (
                  <div
                    className="analytics-payment-card"
                    key={method}
                  >
                    <span>
                      {method.charAt(0).toUpperCase() +
                        method.slice(1)}
                    </span>

                    <strong>${amount.toFixed(2)}</strong>

                    <small>
                      {percentage.toFixed(1)}% of total spending
                    </small>
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default AnalyticsPage;
