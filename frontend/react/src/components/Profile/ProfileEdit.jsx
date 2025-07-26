import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUser, updateUser } from '../../api/users';
import './ProfileEdit.css';
import { useAuth } from '../../hooks/useAuth';

export default function ProfileEdit({}) {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    profile: '',
    skill: '',
    experience: '',
    github_url: '',
    twitter_url: ''
  });
  const [error, setError] = useState('');
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, loading, setUser } = useAuth();

  useEffect(() => {
    if (loading) return;
    // ログインユーザー本人でなければ編集させない
    if (!user || user.id.toString() !== userId) {
      setError('このページを編集する権限がありません。');
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await getUser(userId);
        setProfileData(res.data);
      } catch (err) {
        setError('ユーザー情報の取得に失敗しました。');
      }
    };
    fetchUser();
  }, [userId, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser(userId, profileData);
      navigate(`/users/${userId}`); // 更新後にプロフィールページに戻る
    } catch (err) {
      setError('プロフィールの更新に失敗しました。');
      console.error(err);
    }
  };

  if (error) {
    return <div className="profile-edit-container">{error}</div>;
  }

  if (!profileData.name) {
    return <div className="profile-edit-container">読み込み中...</div>;
  }

  return (
    <div className="profile-edit-container">
      <form onSubmit={handleSubmit} className="profile-edit-form">
        <h2>プロフィール編集</h2>
        <label>名前</label>
        <input type="text" name="name" value={profileData.name} onChange={handleChange} />

        <label>メールアドレス</label>
        <input type="email" name="email" value={profileData.email} onChange={handleChange} />

        <label>自己紹介</label>
        <textarea name="profile" value={profileData.profile || ''} onChange={handleChange}></textarea>

        <label>スキル</label>
        <input type="text" name="skill" value={profileData.skill || ''} onChange={handleChange} />

        <label>経歴</label>
        <textarea name="experience" value={profileData.experience || ''} onChange={handleChange}></textarea>

        <label>GitHub URL</label>
        <input type="text" name="github_url" value={profileData.github_url || ''} onChange={handleChange} />

        <label>Twitter/X URL</label>
        <input type="text" name="twitter_url" value={profileData.twitter_url || ''} onChange={handleChange} />

        <button type="submit">更新する</button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}
