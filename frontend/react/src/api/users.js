import axios from 'axios';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

// ユーザー情報を取得
export const getUser = (userId) => {
  return axios.get(`${API}/api/v1/users/${userId}`, { withCredentials: true });
};

// ユーザー情報を更新
export const updateUser = (userId, userData) => {
  return axios.put(`${API}/api/v1/users/${userId}`, { user: userData }, { withCredentials: true });
};
