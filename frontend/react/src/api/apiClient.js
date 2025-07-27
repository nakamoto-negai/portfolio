import axios from 'axios';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: `${API}`,
  withCredentials: true, // クッキー送信のため必要
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
