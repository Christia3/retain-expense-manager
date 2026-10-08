import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import type { RootState } from '../redux/store';

function AnalyticsPage() {
  const expenses = useSelector(
    (state: RootState) =>
      state.expenses.expenses
  );

  const categories = useSelector(
    (state: RootState) =>
      state.categories.categories
  );

  /*
   * Calculate analytics
   */

  const analytics = useMemo(() => {
    const totalSpending = expenses.reduce(
      (total, expense) =>
        total + expense.amount,
      0
    );

    const expenseCount = expenses.length;

    const averageExpense =
      expenseCount > 0
        ? totalSpending / expenseCount
        : 0;

    const highestExpense =
      expenses.length > 0
        ? expenses.reduce(
            (highest, expense) =>
              expense.amount >
              highest.amount
                ? expense
                : highest
          )
        : null;

    /*
     * Spending by category
     */

    const categoryTotals =
      expenses.reduce<
        Record<string, number>
      >((totals, expense) => {
        totals[expense.category] =
          (totals[expense.category] || 0) +
          expense.amount;

        return totals;
      }, {});

    const sortedCategories =
      Object.entries(categoryTotals).sort(
        ([, amountA], [, amountB]) =>
          amountB - amountA
      );

    /*
     * Spending by payment method
     */

    const paymentTotals =
      expenses.reduce<
        Record<string, number>
      >((totals, expense) => {
        totals[expense.paymentMethod] =
          (totals[expense.paymentMethod] ||
            0) + expense.amount;

        return totals;
      }, {});

    /*
     * Current month spending
     */

    const currentDate = new Date();

    const currentMonthExpenses =
      expenses.filter((expense) => {
        const expenseDate = new Date(
          expense.date
        );

        return (
          expenseDate.getMonth() ===
            currentDate.getMonth() &&
          expenseDate.getFullYear() ===
            currentDate.getFullYear()
        );
      });

    const currentMonthSpending =
      currentMonthExpenses.reduce(
        (total, expense) =>
          total + expense.amount,
        0
      );

    return {
      totalSpending,
      expenseCount,
      averageExpense,
      highestExpense,
      categoryTotals,
      sortedCategories,
      paymentTotals,
      currentMonthSpending,
    };
  }, [expenses]);

  /*
   * Maximum category amount.
   * Used to calculate the width of
   * each category bar.
   */

  const maximumCategoryAmount =
    analytics.sortedCategories.length > 0
      ? analytics.sortedCategories[0][1]
      : 0;

  return (
    <div className="analytics-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="page-header">

        <div>
          <h1>Analytics</h1>

          <p>
            Understand your spending
            patterns and financial activity.
          </p>
        </div>

      </header>

      {/* =========================
          SUMMARY CARDS
      ========================= */}

      <div className="summary-grid">

        <div className="summary-card">

          <span>
            Total Spending
          </span>

          <h2>
            $
            {analytics.totalSpending.toFixed(
              2
            )}
          </h2>

          <p>
            Across all expenses
          </p>

        </div>

        <div className="summary-card">

          <span>
            Total Expenses
          </span>

          <h2>
            {analytics.expenseCount}
          </h2>

          <p>
            Recorded transactions
          </p>

        </div>

        <div className="summary-card">

          <span>
            Average Expense
          </span>

          <h2>
            $
            {analytics.averageExpense.toFixed(
              2
            )}
          </h2>

          <p>
            Average per transaction
          </p>

        </div>

        <div className="summary-card">

          <span>
            This Month
          </span>

          <h2>
            $
            {analytics.currentMonthSpending.toFixed(
              2
            )}
          </h2>

          <p>
            Current month spending
          </p>

        </div>

      </div>

      {/* =========================
          HIGHEST EXPENSE
      ========================= */}

      {analytics.highestExpense && (
        <section className="dashboard-card">

          <div className="card-header">

            <div>
              <h2>
                Highest Expense
              </h2>

              <p>
                Your largest recorded
                transaction.
              </p>
            </div>

          </div>

          <div className="analytics-highlight">

            <div>
              <strong>
                {analytics.highestExpense.title}
              </strong>

              <span>
                {analytics.highestExpense.category}
                {' • '}
                {analytics.highestExpense.date}
              </span>
            </div>

            <strong className="analytics-highlight-amount">
              $
              {analytics.highestExpense.amount.toFixed(
                2
              )}
            </strong>

          </div>

        </section>
      )}

      {/* =========================
          SPENDING BY CATEGORY
      ========================= */}

      <section className="dashboard-card">

        <div className="card-header">

          <div>
            <h2>
              Spending by Category
            </h2>

            <p>
              See where most of your money
              is going.
            </p>
          </div>

        </div>

        {analytics.sortedCategories.length ===
        0 ? (

          <div className="empty-state">
            <h3>
              No spending data yet
            </h3>

            <p>
              Add expenses to see your
              spending breakdown.
            </p>
          </div>

        ) : (

          <div className="analytics-category-list">

            {analytics.sortedCategories.map(
              ([category, amount]) => {

                const percentage =
                  analytics.totalSpending >
                  0
                    ? (amount /
                        analytics.totalSpending) *
                      100
                    : 0;

                const barWidth =
                  maximumCategoryAmount >
                  0
                    ? (amount /
                        maximumCategoryAmount) *
                      100
                    : 0;

                const categoryInfo =
                  categories.find(
                    (item) =>
                      item.name === category
                  );

                return (
                  <div
                    className="analytics-category"
                    key={category}
                  >

                    <div className="analytics-category-header">

                      <div>
                        <strong>
                          {category}
                        </strong>

                        {categoryInfo
                          ?.description && (
                          <span>
                            {
                              categoryInfo.description
                            }
                          </span>
                        )}

                      </div>

                      <div className="analytics-category-values">

                        <strong>
                          $
                          {amount.toFixed(
                            2
                          )}
                        </strong>

                        <span>
                          {percentage.toFixed(
                            1
                          )}
                          %
                        </span>

                      </div>

                    </div>

                    <div className="analytics-bar-background">

                      <div
                        className="analytics-bar"
                        style={{
                          width: `${barWidth}%`,
                        }}
                      />

                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}

      </section>

      {/* =========================
          PAYMENT METHODS
      ========================= */}

      <section className="dashboard-card">

        <div className="card-header">

          <div>
            <h2>
              Spending by Payment Method
            </h2>

            <p>
              See how you pay for your
              expenses.
            </p>
          </div>

        </div>

        {Object.keys(
          analytics.paymentTotals
        ).length === 0 ? (

          <div className="empty-state">
            <h3>
              No payment data yet
            </h3>

            <p>
              Add expenses to see your
              payment method breakdown.
            </p>
          </div>

        ) : (

          <div className="analytics-payment-grid">

            {Object.entries(
              analytics.paymentTotals
            ).map(
              ([method, amount]) => {

                const percentage =
                  analytics.totalSpending >
                  0
                    ? (amount /
                        analytics.totalSpending) *
                      100
                    : 0;

                return (
                  <div
                    className="analytics-payment-card"
                    key={method}
                  >

                    <span>
                      {method}
                    </span>

                    <strong>
                      $
                      {amount.toFixed(
                        2
                      )}
                    </strong>

                    <small>
                      {percentage.toFixed(
                        1
                      )}
                      % of total spending
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