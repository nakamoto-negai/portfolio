import apiClient from './apiClient';

// ユーザー登録API
export const registerUser = ({ name, email, password }) =>
  apiClient.post(`/api/register`, { name, email, password });  

// ログインAPI
export const loginUser = ({ email, password }) =>
  apiClient.post(`/api/login`, { email, password });

// ログイン状態チェックAPI
export const checkLoginStatus = () =>
  apiClient.get(`/api/login_check`);

// ログアウトAPI
export const logoutUser = () =>
  apiClient.post(`/api/logout`);