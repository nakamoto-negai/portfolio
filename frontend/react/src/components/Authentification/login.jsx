import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import { loginUser } from '../../api/auth';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const res = await loginUser({ email, password });
      const user = res.data.user;

      // 親にユーザー情報を渡す
      onLogin(user);
      // ホーム画面へ遷移
      navigate('/');
    } catch (err) {
      console.error('ログイン失敗:', err.response?.data || err.message);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h1 className="login-title">ログイン</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <label>
            メールアドレス
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            パスワード
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit">ログイン</button>
        </form>
      </div>
    </div>
  );
}