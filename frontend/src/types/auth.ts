// ************* Managing Auth Operation Interfaces Here *************

export type UserRole = "seller" | "buyer" | "admin";

export interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: UserRole;
}

export interface SignupCredentials {
  name: string;
  surname: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  userId: string | null;
  token: string | null;
  isAuthenticated: boolean;
}

export const normalizeRole = (role?: string): UserRole =>
  role === "seller" || role === "admin" ? role : "buyer";

export const isSeller = (role?: string) => normalizeRole(role) === "seller";
export const isBuyer = (role?: string) => normalizeRole(role) === "buyer";
export const isAdmin = (role?: string) => normalizeRole(role) === "admin";
