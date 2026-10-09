import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  category: { name: string };
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

function formatMoney(value: number | string): string {
  return Number(value).toLocaleString('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function AdminDashboardPage() {
  const [insights, setInsights] = useState<AdminInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

      setInsights(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load admin insights.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadInsights();
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

        <section className="dashboard-card admin-message">
          <p>Gathering platform activity and spending data...</p>
        </section>
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

        <section className="dashboard-card admin-message">
          <p role="alert">
            {error || 'Admin insights are unavailable.'}
          </p>

          <button type="button" onClick={() => void loadInsights()}>
            Try Again
          </button>
        </section>
      </div>
    );
  }

  const renderCategoryList = (
    categories: AdminCategoryInsight[],
    showProgress = false
  ) => {
    if (categories.length === 0) {
      return <p className="admin-empty">No category data available.</p>;
    }

    const maxTotal = Math.max(
      ...categories.map((category) => Number(category.total)),
      1
    );

    return (
      <div className="admin-list">
        {categories.map((category) => {
          const percentage =
            (Number(category.total) / maxTotal) * 100;

          return (
            <div className="admin-category-item" key={category.id}>
              <div className="admin-list-item">
                <div className="admin-list-details">
                  <strong>{category.name}</strong>
                  <span>
                    {category.expenseCount}{' '}
                    {category.expenseCount === 1
                      ? 'expense'
                      : 'expenses'}
                  </span>
                </div>

                <strong className="admin-list-amount">
                  {formatMoney(category.total)}
                </strong>
              </div>

              {showProgress && (
                <div
                  className="admin-category-progress"
                  role="progressbar"
                  aria-label={`${category.name} spending`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(percentage)}
                >
                  <div
                    className="admin-category-progress-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="admin-page">
      {/* Page header */}
      <header className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Monitor users, expenses, and spending across Retain.</p>
        </div>

        <button
          type="button"
          className="admin-refresh-button"
          onClick={() => void loadInsights()}
        >
          Refresh data
        </button>
      </header>

      {/* Platform statistics */}
      <div className="summary-grid admin-summary-grid">
        <div className="summary-card">
          <span>Total Users</span>
          <h2>{insights.totalUsers.toLocaleString()}</h2>
          <p>Registered accounts</p>
        </div>

        <div className="summary-card">
          <span>Total Expenses</span>
          <h2>{insights.totalExpenses.toLocaleString()}</h2>
          <p>Across all users</p>
        </div>

        <div className="summary-card">
          <span>Total Spending</span>
          <h2>{formatMoney(insights.totalExpenseValue)}</h2>
          <p>All recorded expenses</p>
        </div>

        <div className="summary-card">
          <span>This Month</span>
          <h2>{insights.currentMonthExpenses.toLocaleString()}</h2>
          <p>
            {formatMoney(insights.currentMonthExpenseValue)} spent
          </p>
        </div>
      </div>

      {/* Quick navigation */}
      <section className="admin-quick-links">
        <Link to="/admin/users" className="admin-quick-link">
          <span className="admin-quick-link-icon">♙</span>
          <span>
            <strong>Manage Users</strong>
            <small>View registered accounts</small>
          </span>
          <span aria-hidden="true">→</span>
        </Link>

        <Link to="/admin/expenses" className="admin-quick-link">
          <span className="admin-quick-link-icon">▤</span>
          <span>
            <strong>All Expenses</strong>
            <small>Review platform transactions</small>
          </span>
          <span aria-hidden="true">→</span>
        </Link>

        <Link to="/admin/categories" className="admin-quick-link">
          <span className="admin-quick-link-icon">◇</span>
          <span>
            <strong>Categories</strong>
            <small>Manage expense categories</small>
          </span>
          <span aria-hidden="true">→</span>
        </Link>
      </section>

      {/* Category rankings */}
      <div className="dashboard-grid admin-category-grid">
        <section className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Top 5 Categories</h2>
              <p>Highest spending by category</p>
            </div>
          </div>

          {renderCategoryList(insights.top5Categories)}
        </section>

        <section className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Bottom 5 Categories</h2>
              <p>Lowest categories with recorded spending</p>
            </div>
          </div>

          {renderCategoryList(insights.bottom5Categories)}
        </section>
      </div>

      {/* Spending across all categories */}
      <section className="dashboard-card admin-section">
        <div className="card-header">
          <div>
            <h2>Spending by Category</h2>
            <p>Compare spending across all categories</p>
          </div>
        </div>

        {renderCategoryList(insights.spendingByCategory, true)}
      </section>

      {/* Recent expenses */}
      <section className="dashboard-card admin-section">
        <div className="card-header">
          <div>
            <h2>Recent Expenses</h2>
            <p>Latest recorded expenses across all users</p>
          </div>

          <Link to="/admin/expenses">View all</Link>
        </div>

        {insights.recentExpenses.length === 0 ? (
          <p className="admin-empty">No expenses recorded yet.</p>
        ) : (
          <div className="admin-list">
            {insights.recentExpenses.map((expense) => (
              <div className="admin-list-item" key={expense.id}>
                <div className="admin-list-details">
                  <strong>{expense.title}</strong>
                  <span>
                    {expense.category.name} · {expense.user.name}
                  </span>
                  <span>{expense.user.email}</span>
                </div>

                <div className="admin-list-details admin-list-right">
                  <strong className="admin-list-amount">
                    {formatMoney(expense.amount)}
                  </strong>
                  <span>{formatDate(expense.date)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recently registered users */}
      <section className="dashboard-card admin-section">
        <div className="card-header">
          <div>
            <h2>Recent Users</h2>
            <p>Latest registered accounts</p>
          </div>

          <Link to="/admin/users">View all</Link>
        </div>

        {insights.recentUsers.length === 0 ? (
          <p className="admin-empty">No users registered yet.</p>
        ) : (
          <div className="admin-list">
            {insights.recentUsers.map((user) => (
              <div className="admin-list-item" key={user.id}>
                <div className="admin-list-details">
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>

                <div className="admin-list-details admin-list-right">
                  <strong>{user.role}</strong>
                  <span>{formatDate(user.createdAt)}</span>
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