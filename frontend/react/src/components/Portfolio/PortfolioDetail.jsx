import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPortfolio } from '../../api/portfolios';
import { useAuth } from '../../hooks/useAuth';
import './PortfolioDetail.css';

const PortfolioDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPortfolio();
  }, [id]);

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
          <button onClick={() => navigate('/portfolios')} className="back-button">
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
          <button onClick={() => navigate('/portfolios')} className="back-button">
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
      <div className="detail-wrapper">
        <header className="detail-header">
          <button onClick={() => navigate('/portfolios')} className="back-button">
            <svg className="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 12H5"></path>
              <polyline points="12,19 5,12 12,5"></polyline>
            </svg>
            一覧に戻る
          </button>
          
          <div className="header-actions">
            {isOwner && (
              <button 
                onClick={() => navigate(`/portfolio/${portfolio.id}/edit`)}
                className="edit-button"
              >
                編集
              </button>
            )}
            {portfolio.is_public && (
              <span className="public-badge">
                <svg className="public-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="6"></circle>
                  <circle cx="12" cy="12" r="2"></circle>
                </svg>
                公開中
              </span>
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
              <h2 className="section-title">メイン画像</h2>
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
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                  </svg>
                </div>
                <div className="stat-content">
                  <span className="stat-value">{portfolio.powerpoints_count || 0}</span>
                  <span className="stat-label">PowerPoint</span>
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
              {portfolio.powerpoints_count > 0 && (
                <button 
                  onClick={() => navigate(`/portfolio/${portfolio.id}/powerpoints`)}
                  className="action-btn powerpoint-btn"
                >
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                  </svg>
                  PowerPointファイルを表示 ({portfolio.powerpoints_count})
                </button>
              )}
              
              {portfolio.slides_count > 0 && (
                <button 
                  onClick={() => navigate(`/portfolio/${portfolio.id}/slideshow`)}
                  className="action-btn slideshow-btn"
                >
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polygon points="5,3 19,12 5,21"></polygon>
                  </svg>
                  スライドショーを開始
                </button>
              )}
              
              {isOwner && (
                <button 
                  onClick={() => navigate(`/portfolio/${portfolio.id}/edit`)}
                  className="action-btn edit-btn"
                >
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  編集
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioDetail;