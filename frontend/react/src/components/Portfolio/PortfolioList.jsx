import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublishedPortfolios } from '../../api/portfolios';
import { useAuth } from '../../hooks/useAuth';
import './PortfolioList.css';

const PortfolioList = () => {
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        setLoading(true);
        const data = await getPublishedPortfolios();
        setPortfolios(data);
      } catch (err) {
        setError('ポートフォリオの取得に失敗しました');
        console.error('Error fetching portfolios:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, []);

  if (loading) {
    return <div className="portfolio-loading">読み込み中...</div>;
  }

  if (error) {
    return <div className="portfolio-error">{error}</div>;
  }

  return (
    <div className="portfolio-list">
      <div className="portfolio-list-header">
        <h1 className="portfolio-list-title">ポートフォリオ一覧</h1>
        {user && (
          <Link to="/portfolios/new" className="btn-create">
            新しいポートフォリオを作成
          </Link>
        )}
      </div>
      <div className="portfolio-grid">
        {portfolios.map((portfolio) => (
          <div key={portfolio.id} className="portfolio-card">
            <h3 className="portfolio-title">{portfolio.title}</h3>
            <p className="portfolio-description">{portfolio.description}</p>
            <div className="portfolio-meta">
              <span className="portfolio-author">作成者: {portfolio.user.name}</span>
              <span className="portfolio-date">
                作成日: {new Date(portfolio.created_at).toLocaleDateString()}
              </span>
            </div>
            {user && user.name === portfolio.user.name && (
              <div className="portfolio-actions">
                <Link 
                  to={`/portfolios/${portfolio.id}/powerpoints/upload`} 
                  className="btn-upload-powerpoint"
                >
                  PowerPointをアップロード
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioList;