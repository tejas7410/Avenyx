// ************* Storage get/set Organization Here *************

import { User } from "../types/auth";

export const storage = {
  getToken: () => localStorage.getItem("token"),
  setToken: (token: string) => localStorage.setItem("token", token),
  getUserId: () => localStorage.getItem("userId"),
  setUserId: (id: string) => localStorage.setItem("userId", id),
  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
  setUser: (user: User) => localStorage.setItem("user", JSON.stringify(user)),
  clearAuth: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("user");
  },
};
