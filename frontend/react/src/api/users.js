import apiClient from './apiClient';

export const fetchUsers = () => apiClient.get('/api/users');

export const fetchUserById = (id) => apiClient.get(`/api/users/${id}`);

// ユーザー情報を取得
export const getUser = (userId) => {
  return apiClient.get(`/api/users/${userId}`, { withCredentials: true });
};

// ユーザー情報を更新
export const updateUser = (userId, userData) => {
  return apiClient.put(`/api/users/${userId}`, { user: userData }, { withCredentials: true });
};
