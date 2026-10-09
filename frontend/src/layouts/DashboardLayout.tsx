
import { useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { useAuth } from '../context/AuthContext';
import { fetchCategories } from '../redux/categorySlice';

import type { AppDispatch } from '../redux/store';

function DashboardLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { user, logout, token } = useAuth();

  useEffect(() => {
    if (token) {
      dispatch(fetchCategories());
    }
  }, [dispatch, token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="logo">
          Retain
        </div>

        <div className="user-info">
          <strong>{user?.name}</strong>
          <span>{user?.email}</span>
        </div>

        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/expenses">Expenses</Link>
          <Link to="/budget">Budget</Link>
          <Link to="/analytics">Analytics</Link>

          {user?.role === 'ADMIN' && (
            <>
              <Link to="/admin">Admin Dashboard</Link>
              <Link to="/admin/categories">Categories</Link>
            </>
          )}
        </nav>

        <div className="sidebar-bottom">
          <button type="button" onClick={handleLogout}>
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
