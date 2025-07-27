import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getPortfolio, updatePortfolio, deletePortfolio } from '../../api/portfolios';
import { useAuth } from '../../hooks/useAuth';
import Comments from '../Comments/Comments';
import './PortfolioDetail.css';

const PortfolioDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchPortfolio();
  }, [id]);

  // Determine return path based on state or portfolio ownership
  const getReturnPath = () => {
    if (location.state?.from) {
      return location.state.from;
    }
    // If user owns the portfolio, return to my-portfolios
    if (portfolio && user && portfolio.user && user.id === portfolio.user.id) {
      return '/my-portfolios';
    }
    return '/portfolios';
  };

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const response = await getPortfolio(id);
      setPortfolio(response.data);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      setError(error.response?.data?.error || 'ポートフォリオの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleVisibilityToggle = async (isPublic) => {
    try {
      setIsUpdating(true);
      await updatePortfolio(portfolio.id, { is_public: isPublic });
      setPortfolio({ ...portfolio, is_public: isPublic });
      setShowEditModal(false);
      alert(`ポートフォリオを${isPublic ? '公開' : '非公開'}に設定しました。`);
    } catch (error) {
      console.error('Error updating portfolio:', error);
      alert('更新に失敗しました。もう一度お試しください。');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`「${portfolio.title}」を削除しますか？この操作は取り消せません。`)) {
      try {
        await deletePortfolio(portfolio.id);
        alert('ポートフォリオが削除されました。');
        navigate('/my-portfolios');
      } catch (error) {
        console.error('Error deleting portfolio:', error);
        alert('削除に失敗しました。もう一度お試しください。');
      }
    }
  };

  if (loading) {
    return (
      <div className="portfolio-detail-container">
        <div className="loading-wrapper">
          <div className="loading-spinner"></div>
          <p className="loading-text">ポートフォリオを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portfolio-detail-container">
        <div className="error-wrapper">
          <p className="error-text">エラー: {error}</p>
          <button onClick={() => navigate(getReturnPath())} className="back-button">
            一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="portfolio-detail-container">
        <div className="error-wrapper">
          <p className="error-text">ポートフォリオが見つかりません</p>
          <button onClick={() => navigate(getReturnPath())} className="back-button">
            一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  // Check if current user owns this portfolio
  const isOwner = user && portfolio.user && user.id === portfolio.user.id;

  return (
    <div className="portfolio-detail-container">
      {portfolio.is_public && (
        <div className="public-badge-fixed">
          <svg className="public-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="6"></circle>
            <circle cx="12" cy="12" r="2"></circle>
          </svg>
          公開中
        </div>
      )}
      <div className="detail-wrapper">
        <header className="detail-header">
          <button onClick={() => navigate(getReturnPath())} className="back-button">
            <svg className="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 12H5"></path>
              <polyline points="12,19 5,12 12,5"></polyline>
            </svg>
            一覧に戻る
          </button>
          
          <div className="header-actions">
            {isOwner && (
              <button 
                onClick={() => setShowEditModal(true)}
                className="edit-button"
              >
                編集
              </button>
            )}
          </div>
        </header>

        <div className="detail-content">
          <div className="portfolio-info">
            <h1 className="portfolio-title">{portfolio.title}</h1>
            <p className="portfolio-description">{portfolio.description}</p>
            
            <div className="portfolio-meta">
              <div className="meta-item">
                <span className="meta-label">作成者:</span>
                <span className="meta-value">{portfolio.user?.name || '不明'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">作成日:</span>
                <span className="meta-value">
                  {new Date(portfolio.created_at).toLocaleDateString('ja-JP')}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">更新日:</span>
                <span className="meta-value">
                  {new Date(portfolio.updated_at).toLocaleDateString('ja-JP')}
                </span>
              </div>
            </div>
          </div>

          {portfolio.main_image_url && (
            <div className="main-image-section">
              <h2 className="section-title">表紙</h2>
              <div className="main-image-container">
                <img 
                  src={portfolio.main_image_url} 
                  alt={portfolio.title}
                  className="main-image"
                />
              </div>
            </div>
          )}

          <div className="stats-section">
            <h2 className="section-title">統計情報</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="18" height="10" rx="2" ry="2"></rect>
                    <circle cx="12" cy="8" r="1"></circle>
                  </svg>
                </div>
                <div className="stat-content">
                  <span className="stat-value">{portfolio.slides_count || 0}</span>
                  <span className="stat-label">スライド</span>
                </div>
              </div>


              <div className="stat-card">
                <div className="stat-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </div>
                <div className="stat-content">
                  <span className="stat-value">{portfolio.likes_count || 0}</span>
                  <span className="stat-label">いいね</span>
                </div>
              </div>
            </div>
          </div>

          <div className="actions-section">
            <h2 className="section-title">アクション</h2>
            <div className="action-buttons">
              
              {portfolio.slides_count > 0 && (
                <button 
                  onClick={() => navigate(`/portfolio/${portfolio.id}/slideshow`, { state: { from: getReturnPath() } })}
                  className="action-btn slideshow-btn"
                >
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polygon points="5,3 19,12 5,21"></polygon>
                  </svg>
                  スライドショーを開始
                </button>
              )}
              
              {isOwner && (
                <>
                  <button 
                    onClick={() => setShowEditModal(true)}
                    className="action-btn edit-btn"
                  >
                    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    編集
                  </button>
                  <button 
                    onClick={() => handleDelete()}
                    className="action-btn delete-btn"
                  >
                    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    削除
                  </button>
                </>
              )}
              
            </div>
          </div>

          {/* コメントセクション */}
          <Comments portfolioId={portfolio.id} portfolioOwner={portfolio.user} />
        </div>
      </div>

      {/* 編集モーダル */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => !isUpdating && setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">公開設定の変更</h2>
              <button 
                className="modal-close"
                onClick={() => !isUpdating && setShowEditModal(false)}
                disabled={isUpdating}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <p className="modal-description">
                このポートフォリオの公開設定を選択してください。
              </p>
              
              <div className="visibility-options">
                <button
                  className={`visibility-option ${portfolio.is_public ? 'active' : ''}`}
                  onClick={() => handleVisibilityToggle(true)}
                  disabled={isUpdating}
                >
                  <div className="option-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10"></circle>
                      <circle cx="12" cy="12" r="6"></circle>
                      <circle cx="12" cy="12" r="2"></circle>
                    </svg>
                  </div>
                  <div className="option-content">
                    <h3 className="option-title">公開</h3>
                    <p className="option-description">
                      他のユーザーがこのポートフォリオを閲覧できます
                    </p>
                  </div>
                  {portfolio.is_public && (
                    <div className="option-status">現在の設定</div>
                  )}
                </button>
                
                <button
                  className={`visibility-option ${!portfolio.is_public ? 'active' : ''}`}
                  onClick={() => handleVisibilityToggle(false)}
                  disabled={isUpdating}
                >
                  <div className="option-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  </div>
                  <div className="option-content">
                    <h3 className="option-title">非公開</h3>
                    <p className="option-description">
                      自分だけがこのポートフォリオを閲覧できます
                    </p>
                  </div>
                  {!portfolio.is_public && (
                    <div className="option-status">現在の設定</div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioDetail;