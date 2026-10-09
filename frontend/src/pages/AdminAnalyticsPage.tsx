import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';

interface CategoryInsight {
  id: string;
  name: string;
  description?: string | null;
  total: number | string;
  expenseCount: number;
}

interface AdminInsights {
  totalUsers: number;
  totalExpenses: number;
  totalExpenseValue: number | string;
  currentMonthExpenses: number;
  currentMonthExpenseValue: number | string;
  spendingByCategory: CategoryInsight[];
  top5Categories: CategoryInsight[];
  bottom5Categories: CategoryInsight[];
}

function formatMoney(value: number | string): string {
  return Number(value).toLocaleString('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function AdminAnalyticsPage() {
  const [data, setData] = useState<AdminInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('retain_token');

      if (!token) {
        throw new Error('Please sign in as an administrator.');
      }

      const result = await apiRequest<AdminInsights>(
        '/admin/insights',
        { token }
      );

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load analytics.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="admin-page">
        <header className="page-header">
          <div>
            <h1>Platform Analytics</h1>
            <p>Loading platform-wide spending data...</p>
          </div>
        </header>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="admin-page">
        <header className="page-header">
          <div>
            <h1>Platform Analytics</h1>
            <p>Understand spending across Retain.</p>
          </div>
        </header>

        <section className="dashboard-card admin-message">
          <p role="alert">
            {error || 'Analytics data is unavailable.'}
          </p>
          <button
            type="button"
            onClick={() => void loadAnalytics()}
          >
            Try Again
          </button>
        </section>
      </div>
    );
  }

  const highestCategory = [...data.spendingByCategory]
    .filter((category) => category.expenseCount > 0)
    .sort((a, b) => Number(b.total) - Number(a.total))[0];

  const categoriesWithSpending = data.spendingByCategory.filter(
    (category) => category.expenseCount > 0
  );

  const maximumCategorySpending = Math.max(
    ...categoriesWithSpending.map((category) => Number(category.total)),
    1
  );

  return (
    <div className="admin-page admin-analytics-page">
      <header className="page-header">
        <div>
          <h1>Platform Analytics</h1>
          <p>Spending trends and activity across all Retain users.</p>
        </div>

        <button
          type="button"
          className="admin-refresh-button"
          onClick={() => void loadAnalytics()}
        >
          Refresh data
        </button>
      </header>

      {/* Platform summary */}
      <div className="summary-grid">
        <div className="summary-card">
          <span>Total Users</span>
          <h2>{data.totalUsers.toLocaleString()}</h2>
          <p>Registered accounts</p>
        </div>

        <div className="summary-card">
          <span>Total Expenses</span>
          <h2>{data.totalExpenses.toLocaleString()}</h2>
          <p>All recorded transactions</p>
        </div>

        <div className="summary-card">
          <span>Total Spending</span>
          <h2>{formatMoney(data.totalExpenseValue)}</h2>
          <p>Across all users</p>
        </div>

        <div className="summary-card">
          <span>This Month</span>
          <h2>{data.currentMonthExpenses.toLocaleString()}</h2>
          <p>
            {formatMoney(data.currentMonthExpenseValue)} spent
          </p>
        </div>
      </div>

      {/* Highest spending category */}
      <section className="dashboard-card admin-section">
        <div className="card-header">
          <div>
            <h2>Category Overview</h2>
            <p>Compare spending across expense categories.</p>
          </div>
        </div>

        {highestCategory ? (
          <div className="admin-analytics-highlight">
            <span>Highest spending category</span>
            <h3>{highestCategory.name}</h3>
            <strong>{formatMoney(highestCategory.total)}</strong>
            <p>
              {highestCategory.expenseCount}{' '}
              {highestCategory.expenseCount === 1
                ? 'recorded expense'
                : 'recorded expenses'}
            </p>
          </div>
        ) : (
          <p className="admin-empty">
            No category spending data is available yet.
          </p>
        )}
      </section>

      {/* Category spending comparison */}
      <section className="dashboard-card admin-section">
        <div className="card-header">
          <div>
            <h2>Spending by Category</h2>
            <p>Platform-wide totals for each category.</p>
          </div>
        </div>

        {categoriesWithSpending.length === 0 ? (
          <p className="admin-empty">
            No expenses have been recorded yet.
          </p>
        ) : (
          <div className="admin-analytics-categories">
            {categoriesWithSpending
              .slice()
              .sort((a, b) => Number(b.total) - Number(a.total))
              .map((category) => {
                const amount = Number(category.total);
                const percentage =
                  (amount / maximumCategorySpending) * 100;

                return (
                  <div
                    className="admin-analytics-category"
                    key={category.id}
                  >
                    <div className="admin-analytics-category-info">
                      <div>
                        <strong>{category.name}</strong>
                        <span>
                          {category.expenseCount}{' '}
                          {category.expenseCount === 1
                            ? 'expense'
                            : 'expenses'}
                        </span>
                      </div>

                      <strong>{formatMoney(amount)}</strong>
                    </div>

                    <div className="admin-category-progress">
                      <div
                        className="admin-category-progress-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </section>

      {/* Category rankings */}
      <div className="dashboard-grid admin-category-grid">
        <section className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Top 5 Categories</h2>
              <p>Highest spending</p>
            </div>
          </div>

          {data.top5Categories.length === 0 ? (
            <p className="admin-empty">No spending data yet.</p>
          ) : (
            <div className="admin-list">
              {data.top5Categories.map((category) => (
                <div
                  className="admin-list-item"
                  key={category.id}
                >
                  <div className="admin-list-details">
                    <strong>{category.name}</strong>
                    <span>{category.expenseCount} expenses</span>
                  </div>
                  <strong className="admin-list-amount">
                    {formatMoney(category.total)}
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
              <p>Lowest non-zero spending</p>
            </div>
          </div>

          {data.bottom5Categories.length === 0 ? (
            <p className="admin-empty">No spending data yet.</p>
          ) : (
            <div className="admin-list">
              {data.bottom5Categories.map((category) => (
                <div
                  className="admin-list-item"
                  key={category.id}
                >
                  <div className="admin-list-details">
                    <strong>{category.name}</strong>
                    <span>{category.expenseCount} expenses</span>
                  </div>
                  <strong className="admin-list-amount">
                    {formatMoney(category.total)}
                  </strong>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminAnalyticsPage;
