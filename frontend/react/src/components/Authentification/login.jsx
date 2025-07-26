import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import { loginUser } from '../../api/auth';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // 🔸エラーメッセージ用
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage(''); // 🔸送信前に初期化

    try {
      const res = await loginUser({ email, password });
      navigate('/');
    } catch (err) {
      console.error('ログイン失敗:', err.response?.data || err.message);

      // 🔸サーバーからのメッセージを表示（適宜変えてOK）
      if (err.response?.status === 401) {
        setErrorMessage('メールアドレスまたはパスワードが間違っています');
      } else {
        setErrorMessage('ログインに失敗しました。しばらくしてから再試行してください。');
      }
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h1 className="login-title">ログイン</h1>

        {/* 🔸エラーメッセージの表示 */}
        {errorMessage && <p className="login-error">{errorMessage}</p>}

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
