import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './register.css';
import { registerUser } from '../../api/auth';

export default function Register({ onRegister }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errors, setErrors] = useState([]); // エラー管理用
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors([]); // 前回のエラーをクリア

    if (password !== passwordConfirm) {
      setErrors(['パスワードが一致しません']);
      return;
    }

    try {
      const res = await registerUser({ name, email, password });
      navigate('/');
    } catch (err) {
      const responseErrors = err.response?.data?.errors;
      if (Array.isArray(responseErrors)) {
        setErrors(responseErrors);
      } else if (typeof responseErrors === 'string') {
        setErrors([responseErrors]);
      } else {
        setErrors(['登録に失敗しました。もう一度お試しください。']);
      }
      console.error('登録失敗:', err.response?.data || err.message);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1 className="register-title">新規登録</h1>
        <form onSubmit={handleSubmit} className="register-form">
          {errors.length > 0 && (
            <ul className="error-messages">
              {errors.map((error, index) => (
                <li key={index} className="error-text">{error}</li>
              ))}
            </ul>
          )}
          <label>
            名前
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
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
          <label>
            パスワード確認
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
            />
          </label>
          <button type="submit">登録する</button>
        </form>
      </div>
    </div>
  );
}
