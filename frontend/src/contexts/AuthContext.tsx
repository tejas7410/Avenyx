// ************* This context for managing my auth op logic *************

import {
  createContext,
  useState,
  useCallback,
  useEffect,
  useContext,
  FC,
  ReactNode,
} from "react";
import {
  User,
  LoginCredentials,
  SignupCredentials,
  AuthState,
} from "../types/auth";
import { storage } from "../utils/storage";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BASE_URL = "http://localhost:3000/auth";

export const AuthProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: storage.getUser(),
    userId: storage.getUserId(),
    token: storage.getToken(),
    isAuthenticated: !!storage.getToken(),
  });

  // -> Update auth state and storage
  const updateAuthState = useCallback((newState: Partial<AuthState>) => {
    setAuthState((prev) => ({
      ...prev,
      ...newState,
    }));

    // -> Update storage based on new state
    if (newState.token) storage.setToken(newState.token);
    if (newState.userId) storage.setUserId(newState.userId);
    if (newState.user) storage.setUser(newState.user);
  }, []);

  // -> Login actions
  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // -> Get user profile after successful login with  provided token from backend
      const userResponse = await fetch(
        `${BASE_URL.replace("/auth", "")}/user/profile`,
        {
          headers: {
            Authorization: `Bearer ${data.token.token}`,
          },
        }
      );

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        throw new Error("Failed to fetch user data");
      }

      updateAuthState({
        user: userData.user_data,
        userId: data.token.userId,
        token: data.token.token,
        isAuthenticated: true,
      });
    } catch (error) {
      storage.clearAuth();
      throw error;
    }
  };

  // -> Signup actions
  const signup = async (credentials: SignupCredentials) => {
    try {
      const response = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      // -> Get user profile after successful registration with provided token from backend
      const userResponse = await fetch(
        `${BASE_URL.replace("/auth", "")}/user/profile`,
        {
          headers: {
            Authorization: `Bearer ${data.data.token}`,
          },
        }
      );

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        throw new Error("Failed to fetch user data");
      }

      updateAuthState({
        user: userData.user_data,
        userId: data.data.userId,
        token: data.data.token,
        isAuthenticated: true,
      });
    } catch (error) {
      storage.clearAuth();
      throw error;
    }
  };

  // -> Logout actions
  const logout = useCallback(() => {
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

  // -> Adding authentication header to all requests
  useEffect(() => {
    const token = authState.token;
    if (token) {
    }
  }, [authState.token]);

  const value = {
    ...authState,
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// -> Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// -> Protected Route component
import { Navigate, useLocation } from "react-router-dom";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
