import { useSelector } from 'react-redux';

import type { RootState } from '../redux/store';

function AdminDashboardPage() {
  const expenses = useSelector(
    (state: RootState) => state.expenses.expenses
  );

  const totalExpenseValue = expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  const currentDate = new Date();

  const currentMonthExpenses = expenses.filter(
    (expense) => {
      const expenseDate = new Date(expense.date);

      return (
        expenseDate.getMonth() ===
          currentDate.getMonth() &&
        expenseDate.getFullYear() ===
          currentDate.getFullYear()
      );
    }
  );

  const currentMonthValue =
    currentMonthExpenses.reduce(
      (total, expense) =>
        total + expense.amount,
      0
    );

  const categoryTotals = expenses.reduce<
    Record<string, number>
  >((totals, expense) => {
    totals[expense.category] =
      (totals[expense.category] || 0) +
      expense.amount;

    return totals;
  }, {});

  const sortedCategories = Object.entries(
    categoryTotals
  ).sort(([, amountA], [, amountB]) =>
    amountB - amountA
  );

  const topCategories =
    sortedCategories.slice(0, 5);

  const bottomCategories =
    [...sortedCategories]
      .reverse()
      .slice(0, 5);

  const recentExpenses = [...expenses]
    .sort((a, b) =>
      b.date.localeCompare(a.date)
    )
    .slice(0, 5);

  return (
    <div className="admin-page">

      <header className="page-header">
        <div>
          <h1>Admin Dashboard</h1>

          <p>
            Overview of Retain activity and spending.
          </p>
        </div>
      </header>

      {/* Overview */}

      <div className="summary-grid">

        <div className="summary-card">
          <span>Total Expenses</span>

          <h2>
            {expenses.length}
          </h2>

          <p>All recorded expenses</p>
        </div>

        <div className="summary-card">
          <span>Total Expense Value</span>

          <h2>
            ${totalExpenseValue.toFixed(2)}
          </h2>

          <p>Across all expenses</p>
        </div>

        <div className="summary-card">
          <span>Current Month</span>

          <h2>
            {currentMonthExpenses.length}
          </h2>

          <p>
            ${currentMonthValue.toFixed(2)} spent
          </p>
        </div>

        <div className="summary-card">
          <span>Categories</span>

          <h2>
            {Object.keys(categoryTotals).length}
          </h2>

          <p>Categories with expenses</p>
        </div>

      </div>

      {/* Category Insights */}

      <div className="dashboard-grid">

        <section className="dashboard-card">

          <div className="card-header">
            <div>
              <h2>Top 5 Categories</h2>

              <p>
                Categories with the highest spending
              </p>
            </div>
          </div>

          {topCategories.length === 0 ? (
            <p>No category data available.</p>
          ) : (
            <div className="recent-expenses">

              {topCategories.map(
                ([category, amount]) => (
                  <div
                    className="recent-expense-item"
                    key={category}
                  >
                    <div>
                      <strong>
                        {category}
                      </strong>
                    </div>

                    <strong>
                      ${amount.toFixed(2)}
                    </strong>
                  </div>
                )
              )}

            </div>
          )}

        </section>

        <section className="dashboard-card">

          <div className="card-header">
            <div>
              <h2>Bottom 5 Categories</h2>

              <p>
                Categories with the lowest spending
              </p>
            </div>
          </div>

          {bottomCategories.length === 0 ? (
            <p>No category data available.</p>
          ) : (
            <div className="recent-expenses">

              {bottomCategories.map(
                ([category, amount]) => (
                  <div
                    className="recent-expense-item"
                    key={category}
                  >
                    <div>
                      <strong>
                        {category}
                      </strong>
                    </div>

                    <strong>
                      ${amount.toFixed(2)}
                    </strong>
                  </div>
                )
              )}

            </div>
          )}

        </section>

      </div>

      {/* Recent Expenses */}

      <section className="dashboard-card">

        <div className="card-header">
          <div>
            <h2>Recent Expenses</h2>

            <p>
              Latest recorded expenses
            </p>
          </div>
        </div>

        {recentExpenses.length === 0 ? (
          <p>No expenses recorded yet.</p>
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
  );
}

export default AdminDashboardPage;