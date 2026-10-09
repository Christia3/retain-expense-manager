import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

import { apiRequest } from '../services/api';

// ===============================
// TYPES
// ===============================

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
}

// ===============================
// CONTEXT
// ===============================

const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);

// ===============================
// PROVIDER
// ===============================

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('retain_user');

    return storedUser
      ? JSON.parse(storedUser)
      : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('retain_token');
  });

  const [loading, setLoading] = useState(false);

  // ===============================
  // LOGIN
  // ===============================

  const login = async (
    email: string,
    password: string
  ) => {
    setLoading(true);

    try {
      const data = await apiRequest<{
        message: string;
        token: string;
        user: User;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      });

      setToken(data.token);
      setUser(data.user);

      localStorage.setItem(
        'retain_token',
        data.token
      );

      localStorage.setItem(
        'retain_user',
        JSON.stringify(data.user)
      );
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // SIGN UP
  // ===============================

  const signup = async (
    name: string,
    email: string,
    password: string
  ) => {
    setLoading(true);

    try {
      const data = await apiRequest<{
        message: string;
        user: User;
      }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      // The signup endpoint creates the account,
      // but does not log the user in.
      // Therefore, we automatically log them in.
      await login(email, password);

      return data;
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // LOGOUT
  // ===============================

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem('retain_token');
    localStorage.removeItem('retain_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ===============================
// USE AUTH
// ===============================

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside an AuthProvider'
    );
  }

  return context;
}