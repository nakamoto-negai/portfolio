import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { fetchPublishedPortfolios } from '../../api/portfolios';
import { fetchUsers } from '../../api/users';
import apiClient from '../../api/apiClient';
import './ConnectPage.css';

const ConnectPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [likedPortfolios, setLikedPortfolios] = useState(new Set());

  useEffect(() => {
    fetchPublicPortfolios();
    fetchUsersData();
  }, []);

  const fetchPublicPortfolios = async () => {
    try {
      const data = await fetchPublishedPortfolios();
      setPortfolios(data);
    } catch (error) {
      console.error('公開ポートフォリオの取得に失敗:', error);
    }
  };

  const fetchUsersData = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data.filter(u => u.id !== user?.id));
    } catch (error) {
      console.error('ユーザー一覧の取得に失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendDirectMessage = async () => {
    if (!selectedUser || !messageText.trim()) return;

    try {
      await apiClient.post(`/conversations/${selectedUser.id}/messages`, {
        message: {
          content: messageText
        }
      });
      
      setMessageText('');
      setShowMessageModal(false);
      setSelectedUser(null);
      alert('メッセージを送信しました！');
    } catch (error) {
      console.error('メッセージ送信に失敗:', error);
      alert('メッセージの送信に失敗しました。');
    }
  };

  const openMessageModal = (targetUser) => {
    setSelectedUser(targetUser);
    setShowMessageModal(true);
  };

  const handleLike = async (portfolioId) => {
    if (!user) {
      alert('いいねするにはログインが必要です。');
      return;
    }

    try {
      const isLiked = likedPortfolios.has(portfolioId);
      const endpoint = isLiked ? 'unlike' : 'like';
      const method = isLiked ? 'DELETE' : 'POST';

      const response = await apiClient.request({
        method,
        url: `/portfolios/${portfolioId}/${endpoint}`
      });

      if (response.status === 200 || response.status === 201) {
        const newLikedPortfolios = new Set(likedPortfolios);
        if (isLiked) {
          newLikedPortfolios.delete(portfolioId);
        } else {
          newLikedPortfolios.add(portfolioId);
        }
        setLikedPortfolios(newLikedPortfolios);

        // ポートフォリオ一覧のいいね数を更新
        setPortfolios(portfolios.map(portfolio => 
          portfolio.id === portfolioId 
            ? { ...portfolio, likes_count: response.data.likes_count }
            : portfolio
        ));
      }
    } catch (error) {
      console.error('いいね処理に失敗:', error);
      alert('いいね処理に失敗しました。');
    }
  };

  const getUserPortfolios = (userId) => {
    return portfolios.filter(portfolio => portfolio.user_id === userId);
  };

  if (loading) return <div className="loading">読み込み中...</div>;

  return (
    <div className="connect-page">
      <div className="connect-header">
        <h1>繋がる</h1>
        <p>他のクリエイターの作品を見て、メッセージを送ってみましょう</p>
      </div>

      <div className="portfolios-section">
        <h2>公開されているポートフォリオ</h2>
        <div className="portfolios-grid">
          {portfolios.length > 0 ? (
            portfolios.map((portfolio) => {
              const portfolioUser = users.find(u => u.id === portfolio.user_id);
              return (
                <div key={portfolio.id} className="portfolio-card">
                  <div className="portfolio-thumbnail">
                    {console.log('Portfolio:', portfolio.id, 'Thumbnail URL:', portfolio.thumbnail_image_url, 'Main URL:', portfolio.main_image_url)}
                    {portfolio.thumbnail_image_url ? (
                      <img 
                        src={`http://localhost:3000${portfolio.thumbnail_image_url}`} 
                        alt={portfolio.title}
                        onError={(e) => {
                          console.error('Thumbnail image failed to load:', `http://localhost:3000${portfolio.thumbnail_image_url}`);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                        onLoad={() => console.log('Thumbnail image loaded successfully')}
                      />
                    ) : portfolio.main_image_url ? (
                      <img 
                        src={`http://localhost:3000${portfolio.main_image_url}`} 
                        alt={portfolio.title}
                        onError={(e) => {
                          console.error('Main image failed to load:', `http://localhost:3000${portfolio.main_image_url}`);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                        onLoad={() => console.log('Main image loaded successfully')}
                      />
                    ) : null}
                    <div className="no-image" style={{ display: (portfolio.thumbnail_image_url || portfolio.main_image_url) ? 'none' : 'flex' }}>
                      画像なし
                      <br />
                      <small>Debug: Thumbnail={portfolio.thumbnail_image_url ? 'Yes' : 'No'}, Main={portfolio.main_image_url ? 'Yes' : 'No'}</small>
                    </div>
                  </div>
                  <div className="portfolio-info">
                    <div className="portfolio-header">
                      <h3>{portfolio.title}</h3>
                      <span className="creator-name">
                        by {portfolio.user?.name || portfolioUser?.name || '不明'}
                      </span>
                    </div>
                    <p className="description">{portfolio.description}</p>
                    <div className="portfolio-stats">
                      <span className="slide-count">
                        {portfolio.slides_count || 0} スライド
                      </span>
                      <span className="likes-count">
                        ❤️ {portfolio.likes_count || 0}
                      </span>
                    </div>
                  </div>
                  <div className="portfolio-actions">
                    <button 
                      className={`like-button ${likedPortfolios.has(portfolio.id) ? 'liked' : ''}`}
                      onClick={() => handleLike(portfolio.id)}
                    >
                      {likedPortfolios.has(portfolio.id) ? '❤️' : '🤍'}
                    </button>
                    <button 
                      className="view-button"
                      onClick={() => navigate(`/portfolios/${portfolio.id}`)}
                    >
                      作品を見る
                    </button>
                    {portfolioUser && (
                      <button 
                        className="message-button"
                        onClick={() => navigate(`/messages?partner_id=${portfolioUser.id}`)}
                      >
                        DM
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-portfolios">
              <p>公開されているポートフォリオがありません。</p>
            </div>
          )}
        </div>
      </div>

      <div className="users-section">
        <h2>ユーザー一覧</h2>
        <div className="users-grid">
          {users.map((targetUser) => {
            const userPortfolios = getUserPortfolios(targetUser.id);
            return (
              <div key={targetUser.id} className="user-card">
                <div className="user-info">
                  <h3>{targetUser.name}</h3>
                  <p className="user-email">{targetUser.email}</p>
                  <div className="user-stats">
                    <span className="portfolio-count">
                      {userPortfolios.length} 作品
                    </span>
                  </div>
                </div>
                <div className="user-actions">
                  <button 
                    className="profile-button"
                    onClick={() => navigate(`/users/${targetUser.id}`)}
                  >
                    プロフィール
                  </button>
                  <button 
                    className="message-button"
                    onClick={() => openMessageModal(targetUser)}
                  >
                    DMを送る
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showMessageModal && selectedUser && (
        <div className="message-modal-overlay">
          <div className="message-modal">
            <div className="modal-header">
              <h3>{selectedUser.name}さんにメッセージを送る</h3>
              <button 
                className="close-button"
                onClick={() => setShowMessageModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="メッセージを入力してください..."
                rows="5"
                className="message-textarea"
              />
            </div>
            <div className="modal-actions">
              <button 
                className="send-button"
                onClick={sendDirectMessage}
                disabled={!messageText.trim()}
              >
                送信
              </button>
              <button 
                className="cancel-button"
                onClick={() => setShowMessageModal(false)}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectPage;