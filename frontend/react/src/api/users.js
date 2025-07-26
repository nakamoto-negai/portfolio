import apiClient from './apiClient';

export const fetchUsers = () => apiClient.get('/users');

export const fetchUserById = (id) => apiClient.get(`/users/${id}`);