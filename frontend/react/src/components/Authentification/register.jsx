import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './register.css';
import { registerUser } from '../../api/auth';

export default function Register({ onRegister }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== passwordConfirm) {
      alert('パスワードが一致しません');
      return;
    }

    try {
      // ユーザー登録APIを呼び出す
      const res = await registerUser({ name, email, password });
      const user = res.data.user;

      // 親にユーザー情報を渡す
      onRegister(user);
      // ホーム画面へ遷移
      navigate('/');
    } catch (err) {
      console.error('登録失敗:', err.response?.data || err.message);
      alert('登録に失敗しました。もう一度お試しください。');
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1 className="register-title">新規登録</h1>
        <form onSubmit={handleSubmit} className="register-form">
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