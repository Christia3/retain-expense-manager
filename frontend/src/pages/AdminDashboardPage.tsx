
import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';

interface AdminCategoryInsight {
  id: string;
  name: string;
  description?: string | null;
  total: number | string;
  expenseCount: number;
}

interface AdminRecentExpense {
  id: string;
  title: string;
  amount: number | string;
  date: string;
  createdAt: string;
  category: {
    name: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface AdminRecentUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

interface AdminInsights {
  totalUsers: number;
  totalExpenses: number;
  totalExpenseValue: number | string;
  currentMonthExpenses: number;
  currentMonthExpenseValue: number | string;
  spendingByCategory: AdminCategoryInsight[];
  top5Categories: AdminCategoryInsight[];
  bottom5Categories: AdminCategoryInsight[];
  recentExpenses: AdminRecentExpense[];
  recentUsers: AdminRecentUser[];
}

function AdminDashboardPage() {
  const [insights, setInsights] = useState<AdminInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadInsights() {
      try {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('retain_token');

        if (!token) {
          throw new Error('Please sign in to access admin insights.');
        }

        const data = await apiRequest<AdminInsights>(
          '/admin/insights',
          { token }
        );

        if (!cancelled) {
          setInsights(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load admin insights.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInsights();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="admin-page">
        <header className="page-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Loading platform statistics...</p>
          </div>
        </header>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className="admin-page">
        <header className="page-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Overview of Retain activity and spending.</p>
          </div>
        </header>

        <div className="dashboard-card">
          <p role="alert">
            {error || 'Admin insights are unavailable.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const topCategories = insights.top5Categories;
  const bottomCategories = insights.bottom5Categories;
  const recentExpenses = insights.recentExpenses;
  const recentUsers = insights.recentUsers;

  return (
    <div className="admin-page">
      <header className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Overview of Retain activity and spending.</p>
        </div>
      </header>

      {/* Platform Overview */}
      <div className="summary-grid">
        <div className="summary-card">
          <span>Total Users</span>
          <h2>{insights.totalUsers}</h2>
          <p>Registered accounts</p>
        </div>

        <div className="summary-card">
          <span>Total Expenses</span>
          <h2>{insights.totalExpenses}</h2>
          <p>Across all users</p>
        </div>

        <div className="summary-card">
          <span>Total Expense Value</span>
          <h2>
            ${Number(insights.totalExpenseValue).toFixed(2)}
          </h2>
          <p>Across all recorded expenses</p>
        </div>

        <div className="summary-card">
          <span>Current Month</span>
          <h2>{insights.currentMonthExpenses}</h2>
          <p>
            ${Number(insights.currentMonthExpenseValue).toFixed(2)} spent
          </p>
        </div>
      </div>

      {/* Category Insights */}
      <div className="dashboard-grid">
        <section className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Top 5 Categories</h2>
              <p>Categories with the highest spending</p>
            </div>
          </div>

          {topCategories.length === 0 ? (
            <p>No category data available.</p>
          ) : (
            <div className="recent-expenses">
              {topCategories.map((category) => (
                <div
                  className="recent-expense-item"
                  key={category.id}
                >
                  <div>
                    <strong>{category.name}</strong>
                    <span>{category.expenseCount} expenses</span>
                  </div>
                  <strong>
                    ${Number(category.total).toFixed(2)}
                  </strong>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Bottom 5 Categories</h2>
              <p>Categories with the lowest non-zero spending</p>
            </div>
          </div>

          {bottomCategories.length === 0 ? (
            <p>No category spending data available.</p>
          ) : (
            <div className="recent-expenses">
              {bottomCategories.map((category) => (
                <div
                  className="recent-expense-item"
                  key={category.id}
                >
                  <div>
                    <strong>{category.name}</strong>
                    <span>{category.expenseCount} expenses</span>
                  </div>
                  <strong>
                    ${Number(category.total).toFixed(2)}
                  </strong>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* All Category Spending */}
      <section className="dashboard-card">
        <div className="card-header">
          <div>
            <h2>Spending by Category</h2>
            <p>Platform-wide spending across all categories</p>
          </div>
        </div>

        {insights.spendingByCategory.length === 0 ? (
          <p>No categories available.</p>
        ) : (
          <div className="recent-expenses">
            {insights.spendingByCategory.map((category) => (
              <div
                className="recent-expense-item"
                key={category.id}
              >
                <div>
                  <strong>{category.name}</strong>
                  <span>{category.expenseCount} expenses</span>
                </div>
                <strong>
                  ${Number(category.total).toFixed(2)}
                </strong>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Expenses */}
      <section className="dashboard-card">
        <div className="card-header">
          <div>
            <h2>Recent Expenses</h2>
            <p>Latest recorded expenses across all users</p>
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
                  <strong>{expense.title}</strong>
                  <span>
                    {expense.category.name} · {expense.user.name}
                  </span>
                </div>

                <div>
                  <strong>
                    ${Number(expense.amount).toFixed(2)}
                  </strong>
                  <span>
                    {new Date(expense.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Users */}
      <section className="dashboard-card">
        <div className="card-header">
          <div>
            <h2>Recent Users</h2>
            <p>Latest registered accounts</p>
          </div>
        </div>

        {recentUsers.length === 0 ? (
          <p>No users registered yet.</p>
        ) : (
          <div className="recent-expenses">
            {recentUsers.map((user) => (
              <div
                className="recent-expense-item"
                key={user.id}
              >
                <div>
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>

                <div>
                  <strong>{user.role}</strong>
                  <span>
                    {new Date(user.createdAt).toLocaleDateString()}
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
