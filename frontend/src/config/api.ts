import axios from "axios";
import { storage } from "../utils/storage";

export const API_URLS = {
  monolith: import.meta.env.VITE_MONOLITH_URL || "http://localhost:3000",
  basket: import.meta.env.VITE_BASKET_URL || "http://localhost:3001",
  payment: import.meta.env.VITE_PAYMENT_URL || "http://localhost:3002",
  order: import.meta.env.VITE_ORDER_URL || "http://localhost:3003",
  invoice: import.meta.env.VITE_INVOICE_URL || "http://localhost:3004",
};

export const authHeaders = (): HeadersInit => {
  const token = storage.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiClient = axios.create();

apiClient.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
