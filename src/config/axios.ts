import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Usa la variable de entorno
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});
