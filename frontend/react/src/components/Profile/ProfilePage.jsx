import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUser } from '../../api/users';
import './Profile.css';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const { userId } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUser(userId);
        setUser(res.data);
      } catch (err) {
        setError('ユーザー情報の取得に失敗しました。');
        console.error(err);
      }
    };

    fetchUser();
  }, [userId]);

  if (error) {
    return <div className="profile-container">{error}</div>;
  }

  if (!user) {
    return <div className="profile-container">読み込み中...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1 className="profile-title">プロフィール</h1>
        <div className="profile-info">
          <p><strong>名前:</strong> {user.name}</p>
          <p><strong>メール:</strong> {user.email}</p>
          <p><strong>自己紹介:</strong></p>
          <p className="profile-bio">{user.profile || '未設定'}</p>
          <p><strong>スキル:</strong> {user.skill || '未設定'}</p>
          <p><strong>経歴:</strong> {user.experience || '未設定'}</p>
          <p><strong>GitHub:</strong> <a href={user.github_url} target="_blank" rel="noopener noreferrer">{user.github_url || '未設定'}</a></p>
          <p><strong>Twitter/X:</strong> <a href={user.twitter_url} target="_blank" rel="noopener noreferrer">{user.twitter_url || '未設定'}</a></p>
        </div>
        <Link to={`/users/${userId}/edit`} className="edit-profile-link">プロフィールを編集する</Link>
      </div>
    </div>
  );
}
