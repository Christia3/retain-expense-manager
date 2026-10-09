import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../services/api';

interface AdminExpense {
  id: string;
  title: string;
  description?: string | null;
  amount: number | string;
  date: string;
  createdAt: string;
  paymentMethod: string;
  category: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

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

function formatPaymentMethod(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<AdminExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  async function loadExpenses() {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('retain_token');

      if (!token) {
        throw new Error('Please sign in to view all expenses.');
      }

      const data = await apiRequest<AdminExpense[]>(
        '/admin/expenses',
        { token }
      );

      setExpenses(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load expenses.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadExpenses();
  }, []);

  // Build the category filter options from the returned data.
  const categories = useMemo(
    () =>
      Array.from(
        new Set(expenses.map((expense) => expense.category.name))
      ).sort((a, b) => a.localeCompare(b)),
    [expenses]
  );

  // Search, filter, and sort the platform-wide expenses.
  const filteredExpenses = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    const result = expenses.filter((expense) => {
      const matchesSearch =
        !searchTerm ||
        expense.title.toLowerCase().includes(searchTerm) ||
        (expense.description ?? '').toLowerCase().includes(searchTerm) ||
        expense.user.name.toLowerCase().includes(searchTerm) ||
        expense.user.email.toLowerCase().includes(searchTerm) ||
        expense.category.name.toLowerCase().includes(searchTerm);

      const matchesCategory =
        categoryFilter === 'all' ||
        expense.category.name === categoryFilter;

      const matchesPayment =
        paymentFilter === 'all' ||
        expense.paymentMethod === paymentFilter;

      return matchesSearch && matchesCategory && matchesPayment;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();

        case 'highest':
          return Number(b.amount) - Number(a.amount);

        case 'lowest':
          return Number(a.amount) - Number(b.amount);

        case 'newest':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    return result;
  }, [expenses, search, categoryFilter, paymentFilter, sortBy]);

  // Reset pagination when filters change.
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, paymentFilter, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredExpenses.length / pageSize)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedExpenses = filteredExpenses.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const totalValue = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  const filteredValue = filteredExpenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  const averageValue =
    expenses.length > 0 ? totalValue / expenses.length : 0;

  function resetFilters() {
    setSearch('');
    setCategoryFilter('all');
    setPaymentFilter('all');
    setSortBy('newest');
    setCurrentPage(1);
  }

  if (loading) {
    return (
      <div className="admin-page">
        <header className="page-header">
          <div>
            <h1>All Expenses</h1>
            <p>Loading platform-wide expenses...</p>
          </div>
        </header>

        <section className="dashboard-card">
          <p>Retrieving expenses from all users...</p>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <header className="page-header">
          <div>
            <h1>All Expenses</h1>
            <p>Review expenses recorded across Retain.</p>
          </div>
        </header>

        <section className="dashboard-card admin-error">
          <p role="alert">{error}</p>

          <button type="button" onClick={() => void loadExpenses()}>
            Try Again
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Page heading */}
      <header className="page-header">
        <div>
          <h1>All Expenses</h1>
          <p>View and review expenses across all registered users.</p>
        </div>

        <button
          type="button"
          className="admin-refresh-button"
          onClick={() => void loadExpenses()}
        >
          Refresh data
        </button>
      </header>

      {/* Summary cards */}
      <div className="summary-grid admin-expense-stats">
        <div className="summary-card">
          <span>Total Expenses</span>
          <h2>{expenses.length.toLocaleString()}</h2>
          <p>Across all users</p>
        </div>

        <div className="summary-card">
          <span>Total Spending</span>
          <h2>{formatMoney(totalValue)}</h2>
          <p>All recorded transactions</p>
        </div>

        <div className="summary-card">
          <span>Average Expense</span>
          <h2>{formatMoney(averageValue)}</h2>
          <p>Per recorded transaction</p>
        </div>
      </div>

      {/* Expenses table */}
      <section className="dashboard-card admin-all-expenses-card">
        <div className="card-header">
          <div>
            <h2>Expense Records</h2>
            <p>
              {filteredExpenses.length} matching{' '}
              {filteredExpenses.length === 1 ? 'expense' : 'expenses'}
              {search || categoryFilter !== 'all' || paymentFilter !== 'all'
                ? ` · ${formatMoney(filteredValue)} filtered total`
                : ''}
            </p>
          </div>
        </div>

        {/* Search and filters */}
        <div className="admin-expense-filters">
          <input
            type="search"
            aria-label="Search expenses"
            placeholder="Search title, user, email, or category..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            aria-label="Filter by category"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option value={category} key={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by payment method"
            value={paymentFilter}
            onChange={(event) => setPaymentFilter(event.target.value)}
          >
            <option value="all">All payment methods</option>
            <option value="CASH">Cash</option>
            <option value="CARD">Card</option>
            <option value="MOBILE">Mobile</option>
            <option value="BANK">Bank</option>
          </select>

          <select
            aria-label="Sort expenses"
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value as SortOption)
            }
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="highest">Highest amount</option>
            <option value="lowest">Lowest amount</option>
          </select>
        </div>

        <div className="admin-expense-filter-actions">
          <button
            type="button"
            className="admin-reset-button"
            onClick={resetFilters}
          >
            Reset filters
          </button>
        </div>

        {/* Data table */}
        {paginatedExpenses.length === 0 ? (
          <div className="admin-empty">
            <h3>No expenses found</h3>
            <p>Try changing your search or filters.</p>
          </div>
        ) : (
          <div className="admin-expenses-table-wrapper">
            <table className="admin-expenses-table">
              <thead>
                <tr>
                  <th>Expense</th>
                  <th>User</th>
                  <th>Category</th>
                  <th>Payment</th>
                  <th>Date</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                {paginatedExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>
                      <div className="admin-expense-title">
                        <strong>{expense.title}</strong>
                        {expense.description && (
                          <span>{expense.description}</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="admin-expense-owner">
                        <strong>{expense.user.name}</strong>
                        <span>{expense.user.email}</span>
                      </div>
                    </td>

                    <td>
                      <span className="category-badge">
                        {expense.category.name}
                      </span>
                    </td>

                    <td>{formatPaymentMethod(expense.paymentMethod)}</td>

                    <td>{formatDate(expense.date)}</td>

                    <td className="admin-expense-amount">
                      {formatMoney(expense.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredExpenses.length > 0 && (
          <div className="admin-expense-pagination">
            <span>
              Showing {(safePage - 1) * pageSize + 1}–
              {Math.min(safePage * pageSize, filteredExpenses.length)} of{' '}
              {filteredExpenses.length}
            </span>

            <div>
              <button
                type="button"
                disabled={safePage === 1}
                onClick={() => setCurrentPage((page) => page - 1)}
              >
                Previous
              </button>

              <span className="admin-expense-page-number">
                Page {safePage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={safePage === totalPages}
                onClick={() => setCurrentPage((page) => page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminExpensesPage;
