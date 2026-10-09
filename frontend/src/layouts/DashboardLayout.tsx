import { useEffect } from 'react';
import {
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { useAuth } from '../context/AuthContext';
import { fetchCategories } from '../redux/categorySlice';
import type { AppDispatch } from '../redux/store';

function DashboardLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { user, logout, token } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (token) {
      dispatch(fetchCategories());
    }
  }, [dispatch, token]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'sidebar-link active' : 'sidebar-link';

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="logo">Retain</div>

        <div className="user-info">
          <strong>{user?.name}</strong>
          <span>{user?.email}</span>
          <span className="user-role">
            {isAdmin ? 'Administrator' : 'Personal Account'}
          </span>
        </div>

        <nav className="sidebar-nav">
          {isAdmin ? (
            <>
              <p className="sidebar-section-title">
                ADMINISTRATION
              </p>

              <NavLink
                to="/admin"
                end
                className={linkClass}
              >
                <span className="nav-icon">▦</span>
                Admin Dashboard
              </NavLink>

              <NavLink
                to="/admin/categories"
                className={linkClass}
              >
                <span className="nav-icon">◇</span>
                Categories
              </NavLink>

              <NavLink
                to="/admin/expenses"
                className={linkClass}
              >
                <span className="nav-icon">▤</span>
                All Expenses
              </NavLink>

              <NavLink
                to="/admin/analytics"
                className={linkClass}
              >
                <span className="nav-icon">▥</span>
                Analytics
              </NavLink>

              <NavLink
                to="/admin/users"
                className={linkClass}
              >
                <span className="nav-icon">♙</span>
                Users
              </NavLink>
            </>
          ) : (
            <>
              <p className="sidebar-section-title">
                MY FINANCES
              </p>

              <NavLink
                to="/dashboard"
                className={linkClass}
              >
                <span className="nav-icon">▦</span>
                Dashboard
              </NavLink>

              <NavLink
                to="/expenses"
                className={linkClass}
              >
                <span className="nav-icon">▤</span>
                Expenses
              </NavLink>

              <NavLink
                to="/expenses/add"
                className={linkClass}
              >
                <span className="nav-icon">＋</span>
                Add Expense
              </NavLink>

              <NavLink
                to="/budget"
                className={linkClass}
              >
                <span className="nav-icon">＄</span>
                Budget
              </NavLink>

              <NavLink
                to="/analytics"
                className={linkClass}
              >
                <span className="nav-icon">▥</span>
                Analytics
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-bottom">
          <button
            type="button"
            className="sidebar-link logout-link"
            onClick={handleLogout}
          >
            <span className="nav-icon">↪</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
