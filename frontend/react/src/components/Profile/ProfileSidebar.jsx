import React, { useState, useEffect } from 'react';
import { getUser, updateUser } from '../../api/users';
import './ProfileSidebar.css';

export default function ProfileSidebar({ isOpen, onClose, userId, currentUser }) {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
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
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUser();
    } else if (!isOpen) {
      // サイドバーが閉じられた時に編集状態をリセット
      setIsEditing(false);
      setError('');
      // 編集中のデータも元に戻す（未保存の変更を破棄）
      if (user) {
        setProfileData(user);
      }
    }
  }, [isOpen, userId]);

  // データが変更されているかどうかを検知する関数
  const hasUnsavedChanges = () => {
    if (!user || !isEditing) return false;
    
    // 値の正規化関数（null/undefinedを空文字列に変換）
    const normalize = (value) => value || '';
    
    return (
      normalize(profileData.name) !== normalize(user.name) ||
      normalize(profileData.email) !== normalize(user.email) ||
      normalize(profileData.profile) !== normalize(user.profile) ||
      normalize(profileData.skill) !== normalize(user.skill) ||
      normalize(profileData.experience) !== normalize(user.experience) ||
      normalize(profileData.github_url) !== normalize(user.github_url) ||
      normalize(profileData.twitter_url) !== normalize(user.twitter_url)
    );
  };

  const fetchUser = async () => {
    setLoading(true);
    try {
      // userIdを数値に変換してからAPIを呼び出す
      const numericUserId = parseInt(userId, 10);
      const res = await getUser(numericUserId);
      
      // データを正規化して設定（null/undefinedを空文字列に変換）
      const normalizedData = {
        ...res.data,
        profile: res.data.profile || '',
        skill: res.data.skill || '',
        experience: res.data.experience || '',
        github_url: res.data.github_url || '',
        twitter_url: res.data.twitter_url || ''
      };
      
      setUser(normalizedData);
      setProfileData(normalizedData);
      setError('');
    } catch (err) {
      setError('ユーザー情報の取得に失敗しました。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (!currentUser || currentUser.id.toString() !== userId.toString()) {
      setError('このプロフィールを編集する権限がありません。');
      return;
    }
    setIsEditing(!isEditing);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    // userIdを数値に変換（スコープを外に移動）
    const numericUserId = parseInt(userId, 10);
    
    try {
      const res = await updateUser(numericUserId, profileData);
      setUser(res.data);
      setIsEditing(false);
      setError('');
    } catch (err) {
      console.error('更新エラーの詳細:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
        userId: numericUserId,
        profileData: profileData
      });
      
      if (err.response?.data?.error) {
        setError(`更新に失敗しました: ${err.response.data.error}`);
      } else {
        setError('プロフィールの更新に失敗しました。');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges()) {
      setShowConfirmDialog(true);
    } else {
      cancelEdit();
    }
  };

  const cancelEdit = () => {
    if (user) {
      setProfileData(user);
    }
    setIsEditing(false);
    setError('');
    setShowConfirmDialog(false);
  };

  // 確認ダイアログでの選択処理
  const handleConfirmSave = async () => {
    setShowConfirmDialog(false);
    await handleSave();
    // 保存成功後にサイドバーを閉じる
    onClose();
  };

  const handleConfirmDiscard = () => {
    setShowConfirmDialog(false);
    cancelEdit();
    onClose();
  };

  const handleConfirmCancel = () => {
    setShowConfirmDialog(false);
  };

  // 閉じるボタンの処理
  const handleClose = () => {
    if (hasUnsavedChanges()) {
      setShowConfirmDialog(true);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="profile-sidebar-overlay" onClick={handleClose} />
      <div className={`profile-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="profile-sidebar-header">
          <h2>プロフィール</h2>
          <button className="close-button" onClick={handleClose}>
            ×
          </button>
        </div>
        
        <div className="profile-sidebar-content">
          {loading && <div className="loading">読み込み中...</div>}
          {error && <div className="error-message">{error}</div>}
          
          {user && !loading && (
            <div className="profile-info">
              {!isEditing ? (
                <>
                  <div className="profile-field">
                    <label>名前</label>
                    <p>{user.name}</p>
                  </div>
                  
                  <div className="profile-field">
                    <label>メール</label>
                    <p>{user.email}</p>
                  </div>
                  
                  <div className="profile-field">
                    <label>自己紹介</label>
                    <p className="profile-bio">{user.profile || '未設定'}</p>
                  </div>
                  
                  <div className="profile-field">
                    <label>スキル</label>
                    <p>{user.skill || '未設定'}</p>
                  </div>
                  
                  <div className="profile-field">
                    <label>経歴</label>
                    <p>{user.experience || '未設定'}</p>
                  </div>
                  
                  <div className="profile-field">
                    <label>GitHub</label>
                    <p>
                      {user.github_url ? (
                        <a href={user.github_url} target="_blank" rel="noopener noreferrer">
                          {user.github_url}
                        </a>
                      ) : '未設定'}
                    </p>
                  </div>
                  
                  <div className="profile-field">
                    <label>Twitter/X</label>
                    <p>
                      {user.twitter_url ? (
                        <a href={user.twitter_url} target="_blank" rel="noopener noreferrer">
                          {user.twitter_url}
                        </a>
                      ) : '未設定'}
                    </p>
                  </div>
                  
                  {currentUser && currentUser.id.toString() === userId.toString() && (
                    <button className="edit-button" onClick={handleEditToggle}>
                      編集する
                    </button>
                  )}
                </>
              ) : (
                <div className="edit-form">
                  <div className="profile-field">
                    <label>名前</label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="profile-field">
                    <label>メールアドレス</label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="profile-field">
                    <label>自己紹介</label>
                    <textarea
                      name="profile"
                      value={profileData.profile || ''}
                      onChange={handleChange}
                      rows="4"
                    />
                  </div>
                  
                  <div className="profile-field">
                    <label>スキル</label>
                    <input
                      type="text"
                      name="skill"
                      value={profileData.skill || ''}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="profile-field">
                    <label>経歴</label>
                    <textarea
                      name="experience"
                      value={profileData.experience || ''}
                      onChange={handleChange}
                      rows="3"
                    />
                  </div>
                  
                  <div className="profile-field">
                    <label>GitHub URL</label>
                    <input
                      type="text"
                      name="github_url"
                      value={profileData.github_url || ''}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="profile-field">
                    <label>Twitter/X URL</label>
                    <input
                      type="text"
                      name="twitter_url"
                      value={profileData.twitter_url || ''}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="edit-buttons">
                    <button className="save-button" onClick={handleSave} disabled={loading}>
                      {loading ? '保存中...' : '保存'}
                    </button>
                    <button className="cancel-button" onClick={handleCancel}>
                      キャンセル
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* 確認ダイアログ */}
      {showConfirmDialog && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <h3>未保存の変更があります</h3>
            <p>変更内容を保存しますか？</p>
            <div className="confirm-dialog-buttons">
              <button className="confirm-save-button" onClick={handleConfirmSave} disabled={loading}>
                {loading ? '保存中...' : 'はい（保存）'}
              </button>
              <button className="confirm-discard-button" onClick={handleConfirmDiscard}>
                いいえ（破棄）
              </button>
              <button className="confirm-cancel-button" onClick={handleConfirmCancel}>
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}