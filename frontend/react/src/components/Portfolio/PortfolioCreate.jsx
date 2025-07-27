import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortfolio } from '../../api/portfolios';
import { useAuth } from '../../hooks/useAuth';
import './PortfolioCreate.css';

const PortfolioCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_public: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('ポートフォリオを作成するにはログインが必要です');
      return;
    }

    if (!formData.title.trim()) {
      setError('タイトルを入力してください');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const portfolioData = {
        ...formData,
        user_id: user.id
      };
      
      await createPortfolio(portfolioData);
      navigate('/portfolios');
    } catch (err) {
      setError('ポートフォリオの作成に失敗しました');
      console.error('Portfolio creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="portfolio-create-container">
        <div className="portfolio-create-error">
          ポートフォリオを作成するにはログインが必要です
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-create-container">
      <div className="portfolio-create-form">
        <h1 className="portfolio-create-title">新しいポートフォリオを作成</h1>
        
        {error && <div className="portfolio-create-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">タイトル *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="ポートフォリオのタイトルを入力"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">説明</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="ポートフォリオの説明を入力"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_public"
                checked={formData.is_public}
                onChange={handleInputChange}
              />
              公開する
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate('/portfolios')}
              disabled={loading}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? '作成中...' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PortfolioCreate;