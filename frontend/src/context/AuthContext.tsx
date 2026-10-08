import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  signup: (
    name: string,
    email: string,
    password: string
  ) => boolean;
  logout: () => void;
}

const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const login = (
    email: string,
    password: string
  ): boolean => {
    if (!email || !password) {
      return false;
    }

    /*
      Temporary admin account for frontend testing.

      Later, the backend will handle real
      authentication and roles.
    */
    const isAdmin =
      email.toLowerCase() === 'admin@retain.com';

    const loggedInUser: User = {
      id: isAdmin ? 'admin-1' : 'user-1',
      name: isAdmin ? 'Retain Admin' : 'Retain User',
      email,
      role: isAdmin ? 'admin' : 'user',
    };

    setUser(loggedInUser);

    return true;
  };

  const signup = (
    name: string,
    email: string,
    password: string
  ): boolean => {
    if (!name || !email || !password) {
      return false;
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      role: 'user',
    };

    setUser(newUser);

    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside an AuthProvider'
    );
  }

  return context;
}