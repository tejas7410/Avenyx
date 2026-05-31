// ************* This context for managing my auth op logic *************

import {
  createContext,
  useState,
  useCallback,
  useContext,
  FC,
  ReactNode,
} from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  User,
  LoginCredentials,
  SignupCredentials,
  AuthState,
  UserRole,
  isSeller,
  isBuyer,
  isAdmin,
} from "../types/auth";
import { storage } from "../utils/storage";
import { API_URLS } from "../config/api";
import { authenticateUser, validateUserRole } from "../utils/authApi";

interface AuthContextType extends AuthState {
  role: UserRole | null;
  isSeller: boolean;
  isBuyer: boolean;
  isAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const storedUser = storage.getUser();

  const [authState, setAuthState] = useState<AuthState>({
    user: storedUser,
    userId: storage.getUserId(),
    token: storage.getToken(),
    isAuthenticated: !!storage.getToken(),
  });

  const updateAuthState = useCallback((newState: Partial<AuthState>) => {
    setAuthState((prev) => ({
      ...prev,
      ...newState,
    }));

    if (newState.token) storage.setToken(newState.token);
    if (newState.userId) storage.setUserId(newState.userId);
    if (newState.user) storage.setUser(newState.user);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const { auth, user } = await authenticateUser("login", credentials);
      validateUserRole(user, credentials.role);

      updateAuthState({
        user,
        userId: auth.userId,
        token: auth.token,
        isAuthenticated: true,
      });
    } catch (error) {
      storage.clearAuth();
      throw error;
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    try {
      const { auth, user } = await authenticateUser("register", credentials);

      updateAuthState({
        user,
        userId: auth.userId,
        token: auth.token,
        isAuthenticated: true,
      });
    } catch (error) {
      storage.clearAuth();
      throw error;
    }
  };

  const logout = useCallback(async () => {
    const token = storage.getToken();

    if (token) {
      try {
        await fetch(`${API_URLS.monolith}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch {
        // Clear local session even if backend logout fails
      }
    }

    storage.clearAuth();
    setAuthState({
      user: null,
      userId: null,
      token: null,
      isAuthenticated: false,
    });
  }, []);

  const updateUser = useCallback(
    (user: User) => {
      updateAuthState({ user });
    },
    [updateAuthState]
  );

  const role = authState.user?.role ?? null;

  const value = {
    ...authState,
    role,
    isSeller: isSeller(role ?? undefined),
    isBuyer: isBuyer(role ?? undefined),
    isAdmin: isAdmin(role ?? undefined),
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const SellerRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isSeller } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!isSeller) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const BuyerRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isBuyer } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!isBuyer) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
