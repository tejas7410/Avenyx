// ************* Managing Auth Operation Interfaces Here *************

export interface User {
    id: string;
    name: string;
    surname: string;
    email: string;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface SignupCredentials {
    name: string;
    surname: string;
    email: string;
    password: string;
  }
  
  export interface AuthState {
    user: User | null;
    userId: string | null;
    token: string | null;
    isAuthenticated: boolean;
  }