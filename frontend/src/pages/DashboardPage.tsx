import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import type { RootState } from '../redux/store';

function DashboardPage() {
  const expenses = useSelector(
    (state: RootState) => state.expenses.expenses
  );

  const monthlyBudget = useSelector(
    (state: RootState) => state.budget.monthlyBudget
  );

  const currentDate = new Date();

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get expenses from the current month
  const currentMonthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);

    return (
      expenseDate.getMonth() === currentMonth &&
      expenseDate.getFullYear() === currentYear
    );
  });

  // Calculate total spent
  const totalSpent = currentMonthExpenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  // Calculate remaining budget
  const remainingBudget =
    monthlyBudget - totalSpent;

  // Find highest expense
  const highestExpense =
    currentMonthExpenses.length > 0
      ? currentMonthExpenses.reduce((highest, expense) =>
          expense.amount > highest.amount
            ? expense
            : highest
        )
      : null;

  // Calculate spending by category
  const categoryTotals = currentMonthExpenses.reduce<
    Record<string, number>
  >((totals, expense) => {
    totals[expense.category] =
      (totals[expense.category] || 0) +
      expense.amount;

    return totals;
  }, {});

  // Sort recent expenses by date
  const recentExpenses = [...currentMonthExpenses]
    .sort((a, b) =>
      b.date.localeCompare(a.date)
    )
    .slice(0, 5);

  return (
    <div className="dashboard-page">

      {/* Header */}

      <header className="page-header">

        <div>
          <h1>Welcome back! 👋</h1>

          <p>
            Here's an overview of your spending.
          </p>
        </div>

        <Link
          to="/expenses/add"
          className="primary-button"
        >
          + Add Expense
        </Link>

      </header>

      {/* Summary Cards */}

      <div className="summary-grid">

        <div className="summary-card">
          <span>Total Spent</span>

          <h2>
            ${totalSpent.toFixed(2)}
          </h2>

          <p>
            This month
          </p>
        </div>

        <div className="summary-card">
          <span>Monthly Budget</span>

          <h2>
            ${monthlyBudget.toFixed(2)}
          </h2>

          <p>
            Current budget
          </p>
        </div>

        <div className="summary-card">
          <span>Remaining</span>

          <h2
            className={
              remainingBudget < 0
                ? 'negative-amount'
                : ''
            }
          >
            ${remainingBudget.toFixed(2)}
          </h2>

          <p>
            {remainingBudget < 0
              ? 'Over budget'
              : 'Available'}
          </p>
        </div>

        <div className="summary-card">
          <span>Highest Expense</span>

          <h2>
            $
            {highestExpense
              ? highestExpense.amount.toFixed(2)
              : '0.00'}
          </h2>

          <p>
            {highestExpense
              ? highestExpense.title
              : 'No expenses yet'}
          </p>
        </div>

      </div>

      {/* Main Dashboard Grid */}

      <div className="dashboard-grid">

        {/* Spending by Category */}

        <section className="dashboard-card">

          <div className="card-header">
            <div>
              <h2>Spending by Category</h2>

              <p>
                Your spending this month
              </p>
            </div>
          </div>

          {Object.keys(categoryTotals).length === 0 ? (
            <div className="empty-dashboard">
              <p>
                No expenses recorded this month.
              </p>
            </div>
          ) : (
            <div className="category-list">

              {Object.entries(categoryTotals)
                .sort(([, amountA], [, amountB]) =>
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

                        <span>
                          {category}
                        </span>

                        <span>
                          ${amount.toFixed(2)}
                        </span>

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

        {/* Recent Expenses */}

        <section className="dashboard-card">

          <div className="card-header">

            <div>
              <h2>Recent Expenses</h2>

              <p>
                Your latest transactions
              </p>
            </div>

            <Link to="/expenses">
              View all
            </Link>

          </div>

          {recentExpenses.length === 0 ? (
            <div className="empty-dashboard">
              <p>
                No expenses recorded this month.
              </p>
            </div>
          ) : (
            <div className="recent-expenses">

              {recentExpenses.map((expense) => (
                <div
                  className="recent-expense-item"
                  key={expense.id}
                >

                  <div>
                    <strong>
                      {expense.title}
                    </strong>

                    <span>
                      {expense.category}
                    </span>
                  </div>

                  <div>
                    <strong>
                      ${expense.amount.toFixed(2)}
                    </strong>

                    <span>
                      {expense.date}
                    </span>
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