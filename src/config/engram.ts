import axios from 'axios';

export const engramApi = axios.create({
  baseURL: import.meta.env.VITE_ENGRAM_URL ?? 'http://127.0.0.1:7437',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json'
  }
});
