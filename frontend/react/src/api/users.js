import apiClient from './apiClient';

export const fetchUsers = () => apiClient.get('/users');

export const fetchUserById = (id) => apiClient.get(`/users/${id}`);

// ユーザー情報を取得
export const getUser = (userId) => {
  return apiClient.get(`/users/${userId}`, { withCredentials: true });
};

// ユーザー情報を更新
export const updateUser = (userId, userData) => {
  return apiClient.put(`/users/${userId}`, { user: userData }, { withCredentials: true });
};
