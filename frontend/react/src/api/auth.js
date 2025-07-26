import apiClient from './apiClient';

// ユーザー登録API
export const registerUser = ({ name, email, password }) =>
  apiClient.post(`/register`, { name, email, password });  

// ログインAPI
export const loginUser = ({ email, password }) =>
  apiClient.post(`/login`, { email, password });

// ログイン状態チェックAPI
export const checkLoginStatus = () =>
  apiClient.get(`/login_check`);

// ログアウトAPI
export const logoutUser = () =>
  apiClient.post(`/logout`);