import { API_URLS } from "../config/api";
import { LoginCredentials, SignupCredentials, User, normalizeRole } from "../types/auth";

export interface AuthResponseData {
  token: string;
  userId: string;
}

interface AuthApiResponse {
  message?: string;
  data?: AuthResponseData;
  errors?: Array<{ constraints?: Record<string, string> }>;
}

export function parseAuthError(data: AuthApiResponse, fallback: string): string {
  if (data.errors?.length) {
    const messages = data.errors.flatMap((error) =>
      error.constraints ? Object.values(error.constraints) : []
    );
    if (messages.length > 0) {
      return messages.join(", ");
    }
  }
  return data.message || fallback;
}

export function parseAuthResponse(data: AuthApiResponse): AuthResponseData {
  const token = data.data?.token;
  const userId = data.data?.userId;

  if (!token || !userId) {
    throw new Error("Invalid auth response from server");
  }

  return { token, userId: String(userId) };
}

export async function fetchUserProfile(token: string): Promise<User> {
  const response = await fetch(`${API_URLS.monolith}/user/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const profileData = await response.json();

  if (!response.ok) {
    throw new Error(profileData.message || "Failed to fetch user profile");
  }

  return profileData.user_data;
}

export function validateUserRole(user: User, expectedRole: User["role"]) {
  const actualRole = normalizeRole(user.role);
  if (actualRole !== expectedRole) {
    throw new Error(
      `This account is registered as a ${actualRole}. Please sign in as a ${actualRole}.`
    );
  }
}

export async function authenticateUser(
  endpoint: "login",
  body: LoginCredentials
): Promise<{ auth: AuthResponseData; user: User }>;
export async function authenticateUser(
  endpoint: "register",
  body: SignupCredentials
): Promise<{ auth: AuthResponseData; user: User }>;
export async function authenticateUser(
  endpoint: "login" | "register",
  body: LoginCredentials | SignupCredentials
): Promise<{ auth: AuthResponseData; user: User }> {
  const response = await fetch(`${API_URLS.monolith}/auth/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data: AuthApiResponse = await response.json();

  if (!response.ok) {
    throw new Error(
      parseAuthError(
        data,
        endpoint === "login" ? "Login failed" : "Signup failed"
      )
    );
  }

  const auth = parseAuthResponse(data);
  const user = await fetchUserProfile(auth.token);
  user.role = normalizeRole(user.role);

  return { auth, user };
}
