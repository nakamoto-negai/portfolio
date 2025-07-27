import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { fetchMyPortfolios, createPortfolioWithFiles, updatePortfolio } from '../../api/portfolios';
import './PortfolioGallery.css';

const PortfolioGallery = () => {
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState([]);
  const [newPortfolio, setNewPortfolio] = useState({
    title: '',
    description: '',
    is_public: true
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingPortfolio, setEditingPortfolio] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      console.log('Fetching my portfolios...');
      const data = await fetchMyPortfolios();
      console.log('Portfolios fetched successfully:', data);
      setPortfolios(data);
    } catch (error) {
      console.error('ポートフォリオの取得に失敗:', error);
      if (error.response?.status === 401) {
        alert('ログインが必要です。ログインページに移動してください。');
      } else if (error.response?.status === 500) {
        alert('サーバーエラーが発生しました。しばらく待ってから再試行してください。');
      } else {
        alert('ポートフォリオの取得に失敗しました。');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const pptxFiles = files.filter(file => 
      file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    );
    
    if (pptxFiles.length !== files.length) {
      alert('PPTXファイルのみアップロード可能です。');
      return;
    }
    
    setSelectedFiles(pptxFiles);
  };

  const handleCreatePortfolio = async (e) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      alert('PPTXファイルの選択は必須です。');
      return;
    }

    try {
      const createdPortfolio = await createPortfolioWithFiles(newPortfolio, selectedFiles);
      setPortfolios([...portfolios, createdPortfolio]);
      setNewPortfolio({ title: '', description: '', is_public: true });
      setSelectedFiles([]);
      setShowCreateForm(false);
      alert('ポートフォリオが作成されました！');
    } catch (error) {
      console.error('ポートフォリオの作成に失敗:', error);
      alert('ポートフォリオの作成に失敗しました。');
    }
  };

  const handleEditPortfolio = (portfolio) => {
    setEditingPortfolio({
      id: portfolio.id,
      title: portfolio.title,
      description: portfolio.description,
      is_public: portfolio.is_public
    });
    setShowEditModal(true);
  };

  const handleUpdatePortfolio = async (e) => {
    e.preventDefault();
    try {
      const updatedPortfolio = await updatePortfolio(editingPortfolio.id, {
        title: editingPortfolio.title,
        description: editingPortfolio.description,
        is_public: editingPortfolio.is_public
      });
      
      setPortfolios(portfolios.map(portfolio => 
        portfolio.id === editingPortfolio.id 
          ? { ...portfolio, ...updatedPortfolio }
          : portfolio
      ));
      
      setEditingPortfolio(null);
      setShowEditModal(false);
      alert('ポートフォリオが更新されました！');
    } catch (error) {
      console.error('ポートフォリオの更新に失敗:', error);
      alert('ポートフォリオの更新に失敗しました。');
    }
  };

  if (loading) return <div className="loading">読み込み中...</div>;

  return (
    <div className="portfolio-gallery">
      <div className="gallery-header">
        <h1>作品ギャラリー</h1>
        <button 
          className="create-button"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          新しいポートフォリオを作成
        </button>
      </div>

      {showCreateForm && (
        <div className="create-form-container">
          <form onSubmit={handleCreatePortfolio} className="create-form">
            <div className="form-group">
              <label htmlFor="title">タイトル</label>
              <input
                type="text"
                id="title"
                value={newPortfolio.title}
                onChange={(e) => setNewPortfolio({...newPortfolio, title: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">説明</label>
              <textarea
                id="description"
                value={newPortfolio.description}
                onChange={(e) => setNewPortfolio({...newPortfolio, description: e.target.value})}
                rows="4"
              />
            </div>
            <div className="form-group">
              <label htmlFor="pptx-files">PPTXファイル（必須）</label>
              <input
                type="file"
                id="pptx-files"
                accept=".pptx"
                multiple
                onChange={handleFileChange}
                required
              />
              {selectedFiles.length > 0 && (
                <div className="selected-files">
                  <p>選択されたファイル:</p>
                  <ul>
                    {selectedFiles.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={newPortfolio.is_public}
                  onChange={(e) => setNewPortfolio({...newPortfolio, is_public: e.target.checked})}
                />
                公開設定
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-button">作成</button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => setShowCreateForm(false)}
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="portfolios-grid">
        {portfolios.length > 0 ? (
          portfolios.map((portfolio) => (
            <div key={portfolio.id} className="portfolio-card">
              <div className="portfolio-thumbnail">
                {portfolio.thumbnail_image_url ? (
                  <img 
                    src={`http://localhost:3000${portfolio.thumbnail_image_url}`} 
                    alt={portfolio.title}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : portfolio.main_image_url ? (
                  <img 
                    src={`http://localhost:3000${portfolio.main_image_url}`} 
                    alt={portfolio.title}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="no-image" style={{ display: (portfolio.thumbnail_image_url || portfolio.main_image_url) ? 'none' : 'flex' }}>
                  画像なし
                  <br />
                  <small>Debug: Thumbnail={portfolio.thumbnail_image_url ? 'Yes' : 'No'}, Main={portfolio.main_image_url ? 'Yes' : 'No'}</small>
                </div>
              </div>
              <div className="portfolio-info">
                <h3>{portfolio.title}</h3>
                <p>{portfolio.description}</p>
                <div className="portfolio-meta">
                  <span className={`status ${portfolio.is_public ? 'public' : 'private'}`}>
                    {portfolio.is_public ? '公開' : '非公開'}
                  </span>
                  <span className="slide-count">
                    {portfolio.slides_count || 0} スライド
                  </span>
                </div>
              </div>
              <div className="portfolio-actions">
                <button 
                  className="edit-button"
                  onClick={() => handleEditPortfolio(portfolio)}
                >
                  編集
                </button>
                <button className="view-button">表示</button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-portfolios">
            <p>まだポートフォリオがありません。</p>
            <button 
              className="create-first-button"
              onClick={() => setShowCreateForm(true)}
            >
              最初のポートフォリオを作成
            </button>
          </div>
        )}
      </div>

      {/* 編集モーダル */}
      {showEditModal && editingPortfolio && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>ポートフォリオを編集</h3>
              <button 
                className="close-button"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdatePortfolio} className="modal-form">
              <div className="form-group">
                <label htmlFor="edit-title">タイトル</label>
                <input
                  type="text"
                  id="edit-title"
                  value={editingPortfolio.title}
                  onChange={(e) => setEditingPortfolio({...editingPortfolio, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-description">説明</label>
                <textarea
                  id="edit-description"
                  value={editingPortfolio.description}
                  onChange={(e) => setEditingPortfolio({...editingPortfolio, description: e.target.value})}
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={editingPortfolio.is_public}
                    onChange={(e) => setEditingPortfolio({...editingPortfolio, is_public: e.target.checked})}
                  />
                  公開設定
                </label>
              </div>
              <div className="modal-actions">
                <button type="submit" className="submit-button">更新</button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowEditModal(false)}
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioGallery;