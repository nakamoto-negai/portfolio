import apiClient from './apiClient';

export const fetchUsers = () => apiClient.get('/users');

export const fetchUserById = (id) => apiClient.get(`/users/${id}`);

// ユーザー情報を取得
export const getUser = (userId) => {
  return apiClient.get(`${API}/api/v1/users/${userId}`, { withCredentials: true });
};

// ユーザー情報を更新
export const updateUser = (userId, userData) => {
  return apiClient.put(`${API}/api/v1/users/${userId}`, { user: userData }, { withCredentials: true });
};
