import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../services/api';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      try {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('retain_token');

        if (!token) {
          throw new Error('Please sign in to view users.');
        }

        const data = await apiRequest<AdminUser[]>('/admin/users', {
          token,
        });

        if (!cancelled) {
          setUsers(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load users.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);

      const matchesRole =
        roleFilter === 'ALL' || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const regularUsers = users.filter(
    (user) => user.role === 'USER'
  ).length;

  const administrators = users.filter(
    (user) => user.role === 'ADMIN'
  ).length;

  return (
    <div className="admin-page">
      <header className="page-header">
        <div>
          <h1>Users</h1>
          <p>View registered accounts across Retain.</p>
        </div>
      </header>

      <div className="admin-user-stats">
        <div className="summary-card">
          <span>Total Users</span>
          <h2>{users.length}</h2>
          <p>Registered accounts</p>
        </div>

        <div className="summary-card">
          <span>Regular Users</span>
          <h2>{regularUsers}</h2>
          <p>Personal accounts</p>
        </div>

        <div className="summary-card">
          <span>Administrators</span>
          <h2>{administrators}</h2>
          <p>Admin accounts</p>
        </div>
      </div>

      <section className="dashboard-card admin-users-card">
        <div className="card-header">
          <div>
            <h2>Registered Accounts</h2>
            <p>
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </div>
        </div>

        <div className="admin-user-filters">
          <input
            type="search"
            aria-label="Search users"
            placeholder="Search by name or email..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            aria-label="Filter by role"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
          >
            <option value="ALL">All roles</option>
            <option value="USER">Regular users</option>
            <option value="ADMIN">Administrators</option>
          </select>
        </div>

        {loading ? (
          <p className="admin-empty">Loading users...</p>
        ) : error ? (
          <p className="admin-error" role="alert">
            {error}
          </p>
        ) : filteredUsers.length === 0 ? (
          <p className="admin-empty">
            No matching users found.
          </p>
        ) : (
          <div className="admin-users-table-wrapper">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Date Registered</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="admin-user-name">
                      {user.name}
                    </td>

                    <td>{user.email}</td>

                    <td>
                      <span
                        className={`admin-role-badge ${
                          user.role === 'ADMIN'
                            ? 'admin-role-badge-admin'
                            : 'admin-role-badge-user'
                        }`}
                      >
                        {user.role === 'ADMIN'
                          ? 'Administrator'
                          : 'User'}
                      </span>
                    </td>

                    <td>
                      {new Date(
                        user.createdAt
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminUsersPage;