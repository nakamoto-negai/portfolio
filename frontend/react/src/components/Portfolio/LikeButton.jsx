import React, { useState, useEffect } from 'react';
import './LikeButton.css';
import { likesApi } from '../../api/likes';
import { useAuth } from '../../hooks/useAuth';

const LikeButton = ({ portfolioId, initialLiked = false, initialCount = 0, size = 'medium' }) => {
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // コンポーネントマウント時に最新のいいね状況を取得
  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!portfolioId) return;
      
      try {
        const status = await likesApi.getStatus(portfolioId);
        setLiked(status.liked);
        setLikesCount(status.likes_count);
      } catch (error) {
        console.error('Failed to fetch like status:', error);
      }
    };

    fetchLikeStatus();
  }, [portfolioId]);

  const handleLikeToggle = async () => {
    if (!user) {
      alert('ログインが必要です');
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      const result = await likesApi.toggle(portfolioId);
      
      if (result.success) {
        setLiked(result.liked);
        setLikesCount(result.likes_count);
      } else {
        alert(result.message || 'エラーが発生しました');
      }
    } catch (error) {
      console.error('Like toggle failed:', error);
      if (error.response?.status === 401) {
        alert('ログインが必要です');
      } else {
        alert('エラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const buttonClass = `like-button ${size} ${liked ? 'liked' : ''} ${loading ? 'loading' : ''}`;

  return (
    <button 
      className={buttonClass}
      onClick={handleLikeToggle}
      disabled={loading || !user}
      title={user ? (liked ? 'いいねを取り消す' : 'いいねする') : 'ログインが必要です'}
    >
      <span className="like-icon">
        {liked ? '❤️' : '🤍'}
      </span>
      <span className="like-count">
        {likesCount}
      </span>
    </button>
  );
};

export default LikeButton;