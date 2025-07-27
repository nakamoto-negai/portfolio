import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyPortfolios, deletePortfolio } from '../../api/portfolios';
import './PortfolioList.css';

const MyPortfolioList = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      const response = await getMyPortfolios();
      setPortfolios(response.data);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      setError(error.response?.data?.error || 'ポートフォリオの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handlePortfolioClick = (portfolioId) => {
    navigate(`/portfolio/${portfolioId}`);
  };

  const handleCreateNew = () => {
    navigate('/gallery');
  };

  const handleDelete = async (portfolioId, portfolioTitle) => {
    if (window.confirm(`「${portfolioTitle}」を削除しますか？この操作は取り消せません。`)) {
      try {
        await deletePortfolio(portfolioId);
        alert('ポートフォリオが削除されました。');
        // 一覧を再取得
        fetchPortfolios();
      } catch (error) {
        console.error('Error deleting portfolio:', error);
        alert('削除に失敗しました。もう一度お試しください。');
      }
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 MB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  const truncateText = (text, length = 100) => {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  if (loading) {
    return (
      <div className="portfolio-list-container">
        <div className="loading-wrapper">
          <div className="loading-spinner"></div>
          <p className="loading-text">ポートフォリオを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portfolio-list-container">
        <div className="error-wrapper">
          <p className="error-text">エラー: {error}</p>
          <button onClick={fetchPortfolios} className="retry-button">
            再試行
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-list-container">
      {/* Independent Home Button */}
      <button onClick={handleGoHome} className="home-button-fixed">
        <svg className="home-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9,22 9,12 15,12 15,22"></polyline>
        </svg>
        ホーム
      </button>
      
      <div className="list-wrapper">
        <header className="list-header">
          <div className="header-content">
            <h1 className="list-title">マイポートフォリオ</h1>
            <p className="list-subtitle">あなたの作品を一覧で確認・管理できます</p>
          </div>
          <button onClick={handleCreateNew} className="create-button">
            <svg className="create-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            新規作成
          </button>
        </header>

        {portfolios.length === 0 ? (
          <div className="empty-state">
            <div className="empty-content">
              <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21,15 16,10 5,21"></polyline>
              </svg>
              <h3 className="empty-title">ポートフォリオがありません</h3>
              <p className="empty-description">
                最初のポートフォリオを作成してみましょう！
              </p>
              <button onClick={handleCreateNew} className="empty-create-button">
                投稿する
              </button>
            </div>
          </div>
        ) : (
          <div className="portfolio-grid">
            {portfolios.map((portfolio) => (
              <div 
                key={portfolio.id} 
                className="portfolio-card"
                onClick={() => handlePortfolioClick(portfolio.id)}
              >
                <div className="card-image">
                  {portfolio.main_image_url ? (
                    <img 
                      src={portfolio.main_image_url} 
                      alt={portfolio.title}
                      className="portfolio-image"
                    />
                  ) : (
                    <div className="placeholder-image">
                      <svg className="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21,15 16,10 5,21"></polyline>
                      </svg>
                    </div>
                  )}
                  {portfolio.is_public && (
                    <div className="public-badge">
                      <svg className="public-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10"></circle>
                        <circle cx="12" cy="12" r="6"></circle>
                        <circle cx="12" cy="12" r="2"></circle>
                      </svg>
                      公開
                    </div>
                  )}
                </div>

                <div className="card-content">
                  <h3 className="card-title">{portfolio.title}</h3>
                  <p className="card-description">
                    {truncateText(portfolio.description)}
                  </p>

                  {portfolio.powerpoints_count > 0 && (
                    <div className="powerpoint-info">
                      <div className="info-header">
                        <svg className="powerpoint-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                          <polyline points="14,2 14,8 20,8"></polyline>
                        </svg>
                        <span className="info-label">PowerPointファイル</span>
                      </div>
                      <div className="info-details">
                        <span className="file-count">
                          {portfolio.powerpoints_count}個のファイル
                        </span>
                        <span className="file-size">
                          {formatFileSize(portfolio.total_powerpoint_size)}
                        </span>
                      </div>
                      {portfolio.latest_powerpoint_filename && (
                        <div className="latest-file">
                          最新: {truncateText(portfolio.latest_powerpoint_filename, 30)}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="card-stats">
                    <div className="stat-item">
                      <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <rect x="3" y="3" width="18" height="10" rx="2" ry="2"></rect>
                        <circle cx="12" cy="8" r="1"></circle>
                      </svg>
                      <span>{portfolio.slides_count || 0}枚</span>
                    </div>
                    <div className="stat-item">
                      <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                      <span>{portfolio.likes_count || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  <button 
                    className="action-button view-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/portfolio/${portfolio.id}/slideshow`);
                    }}
                  >
                    表示
                  </button>
                  <button 
                    className="action-button detail-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePortfolioClick(portfolio.id);
                    }}
                  >
                    詳細
                  </button>
                  <button 
                    className="action-button delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(portfolio.id, portfolio.title);
                    }}
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPortfolioList;