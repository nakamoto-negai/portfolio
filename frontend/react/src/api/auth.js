import axios from 'axios';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

// ユーザー登録API
export const registerUser = ({ name, email, password }) => {
  return axios.post(`${API}/register`, {
    name,
    email,
    password,
  }, {
    withCredentials: true, // クッキーを含めるための設定
  });
};  

// ログインAPI
export const loginUser = ({ email, password }) => {
  return axios.post(`${API}/login`, {
    email,
    password,
  }, {
    withCredentials: true, 
  });
};

export const checkLoginStatus = () => {
  return axios.get(`${API}/login_check`, {
    withCredentials: true,
  });
};

// ログアウトAPI
export const logoutUser = () => {
  return axios.post(`${API}/logout`, {}, {
    withCredentials: true, 
  });
};