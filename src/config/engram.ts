import axios from 'axios';

const AUTH_STORAGE_KEY = 'engram-auth-token';

export const getStoredAuthToken = (): string => {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
};

export const setStoredAuthToken = (token: string): void => {
  try {
    const trimmed = token.trim();
    if (trimmed) {
      localStorage.setItem(AUTH_STORAGE_KEY, trimmed);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {
    // Storage access blocked — ignore
  }
};

export const engramApi = axios.create({
  baseURL: import.meta.env.VITE_ENGRAM_URL ?? 'http://[IP]:7437',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json'
  }
});

engramApi.interceptors.request.use((config) => {
  const token = getStoredAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
