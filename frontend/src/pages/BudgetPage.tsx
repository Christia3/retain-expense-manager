import { FormEvent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../redux/store';
import { setMonthlyBudget } from '../redux/budgetSlice';

function BudgetPage() {
  const dispatch = useDispatch();

  const monthlyBudget = useSelector(
    (state: RootState) => state.budget.monthlyBudget
  );

  const expenses = useSelector(
    (state: RootState) => state.expenses.expenses
  );

  const [budgetInput, setBudgetInput] = useState(
    String(monthlyBudget)
  );

  // Get the current month and year
  const currentDate = new Date();

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Calculate total spending for the current month
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

  const remainingBudget =
    monthlyBudget - totalSpent;

  let budgetStatus = 'Within Budget';

  if (remainingBudget < 0) {
    budgetStatus = 'Over Budget';
  } else if (
    monthlyBudget > 0 &&
    remainingBudget <= monthlyBudget * 0.2
  ) {
    budgetStatus = 'Approaching Limit';
  }

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const newBudget = Number(budgetInput);

    if (newBudget > 0) {
      dispatch(setMonthlyBudget(newBudget));
    }
  };

  return (
    <div className="budget-page">

      <header className="page-header">
        <div>
          <h1>Monthly Budget</h1>
          <p>
            Manage your monthly spending budget.
          </p>
        </div>
      </header>

      {/* Budget Summary */}

      <div className="budget-summary-grid">

        <div className="budget-summary-card">
          <span>Monthly Budget</span>

          <h2>
            ${monthlyBudget.toFixed(2)}
          </h2>
        </div>

        <div className="budget-summary-card">
          <span>Total Spent</span>

          <h2>
            ${totalSpent.toFixed(2)}
          </h2>
        </div>

        <div className="budget-summary-card">
          <span>Remaining Budget</span>

          <h2
            className={
              remainingBudget < 0
                ? 'negative-amount'
                : ''
            }
          >
            ${remainingBudget.toFixed(2)}
          </h2>
        </div>

        <div className="budget-summary-card">
          <span>Status</span>

          <h2>
            {budgetStatus}
          </h2>
        </div>

      </div>

      {/* Update Budget */}

      <div className="budget-card">

        <div className="budget-card-header">
          <h2>Update Monthly Budget</h2>

          <p>
            Set the amount you want to spend each month.
          </p>
        </div>

        <form
          className="budget-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">

            <label htmlFor="monthlyBudget">
              Monthly Budget
            </label>

            <input
              id="monthlyBudget"
              type="number"
              min="1"
              step="0.01"
              value={budgetInput}
              onChange={(event) =>
                setBudgetInput(event.target.value)
              }
            />

          </div>

          <button
            type="submit"
            className="save-expense-button"
          >
            Update Budget
          </button>

        </form>

      </div>

      {/* Spending Progress */}

      <div className="budget-card">

        <div className="budget-card-header">
          <h2>Budget Progress</h2>

          <p>
            Your spending for the current month.
          </p>
        </div>

        <div className="budget-progress">

          <div className="budget-progress-header">
            <span>
              ${totalSpent.toFixed(2)} spent
            </span>

            <span>
              ${monthlyBudget.toFixed(2)} budget
            </span>
          </div>

          <div className="budget-progress-bar">

            <div
              className={`budget-progress-fill ${
                remainingBudget < 0
                  ? 'over-budget'
                  : ''
              }`}
              style={{
                width: `${Math.min(
                  monthlyBudget > 0
                    ? (totalSpent / monthlyBudget) * 100
                    : 0,
                  100
                )}%`,
              }}
            />

          </div>

        </div>

      </div>

    </div>
  );
}

export default BudgetPage;