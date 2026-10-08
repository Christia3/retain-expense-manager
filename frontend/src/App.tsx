import './App.css';

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

// Layout
import DashboardLayout from './layouts/DashboardLayout';

// Route protection
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Regular pages
import DashboardPage from './pages/DashboardPage';
import ExpensesPage from './pages/ExpensesPage';
import AddExpensePage from './pages/AddExpensePage';
import BudgetPage from './pages/BudgetPage';
import AnalyticsPage from './pages/AnalyticsPage';

// Authentication pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Admin pages
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            AUTHENTICATION ROUTES
        ========================= */}

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/signup"
          element={<SignupPage />}
        />

        {/* =========================
            PROTECTED USER ROUTES
        ========================= */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/"
            element={<DashboardLayout />}
          >

            <Route
              index
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />

            <Route
              path="dashboard"
              element={<DashboardPage />}
            />

            <Route
              path="expenses"
              element={<ExpensesPage />}
            />

            <Route
              path="expenses/add"
              element={<AddExpensePage />}
            />

            <Route
              path="expenses/edit/:id"
              element={<AddExpensePage />}
            />

            <Route
              path="budget"
              element={<BudgetPage />}
            />

            <Route
              path="analytics"
              element={<AnalyticsPage />}
            />

          </Route>

        </Route>

        {/* =========================
            PROTECTED ADMIN ROUTES
        ========================= */}

        <Route element={<AdminRoute />}>

          <Route
            path="/admin"
            element={<DashboardLayout />}
          >

            {/* Admin Dashboard */}
            <Route
              index
              element={<AdminDashboardPage />}
            />

            {/* Admin Category Management */}
            <Route
              path="categories"
              element={<AdminCategoriesPage />}
            />

          </Route>

        </Route>

        {/* =========================
            FALLBACK ROUTE
        ========================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;