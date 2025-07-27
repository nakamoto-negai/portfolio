import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortfolio } from '../../api/portfolios';
import './PortfolioUpload.css';

const PortfolioUpload = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_public: false
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const data = new FormData();
      data.append('portfolio[title]', formData.title);
      data.append('portfolio[description]', formData.description);
      data.append('portfolio[is_public]', formData.is_public);
      
      selectedFiles.forEach((file) => {
        data.append('portfolio[powerpoint_files][]', file);
      });

      const response = await createPortfolio(data);
      
      alert('ポートフォリオが正常に作成されました！');
      setFormData({ title: '', description: '', is_public: false });
      setSelectedFiles([]);
      navigate('/portfolios'); // ポートフォリオ一覧ページにリダイレクト
    } catch (error) {
      console.error('Error uploading portfolio:', error);
      const errorMessage = error.response?.data?.message || 'アップロードに失敗しました。もう一度お試しください。';
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    return (bytes / 1024 / 1024).toFixed(2);
  };

  return (
    <div className="portfolio-upload-container">
      <div className="upload-wrapper">
        <header className="upload-header">
          <h1 className="upload-title">新しいポートフォリオを作成</h1>
          <p className="upload-subtitle">PowerPointファイルからポートフォリオを生成します</p>
        </header>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-section">
            <h2 className="section-title">基本情報</h2>
            
            <div className="form-group">
              <label htmlFor="title" className="form-label">タイトル</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="form-input"
                placeholder="ポートフォリオのタイトルを入力してください"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">説明</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="form-textarea"
                placeholder="ポートフォリオの説明を入力してください"
              />
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_public"
                  checked={formData.is_public}
                  onChange={handleInputChange}
                  className="form-checkbox"
                />
                <span className="checkbox-text">公開する</span>
              </label>
              <p className="checkbox-description">
                チェックすると他のユーザーがこのポートフォリオを閲覧できます
              </p>
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">PowerPointファイル</h2>
            
            <div className="file-upload-area">
              <label htmlFor="files" className="file-upload-label">
                <div className="file-upload-content">
                  <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7,10 12,15 17,10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span className="upload-text">
                    ファイルを選択またはドラッグ&ドロップ
                  </span>
                  <span className="upload-subtext">
                    .pptx または .ppt ファイル（複数選択可能、各ファイル最大50MB）
                  </span>
                </div>
              </label>
              <input
                type="file"
                id="files"
                multiple
                accept=".pptx,.ppt"
                onChange={handleFileChange}
                className="file-input"
              />
            </div>

            {selectedFiles.length > 0 && (
              <div className="file-preview">
                <h3 className="preview-title">選択されたファイル:</h3>
                <ul className="file-list">
                  {selectedFiles.map((file, index) => (
                    <li key={index} className="file-item">
                      <div className="file-info">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">({formatFileSize(file.size)} MB)</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel"
              onClick={() => navigate('/')}
            >
              キャンセル
            </button>
            <button 
              type="submit" 
              className="btn-submit"
              disabled={isUploading || !formData.title || selectedFiles.length === 0}
            >
              {isUploading ? 'アップロード中...' : 'ポートフォリオを作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PortfolioUpload;