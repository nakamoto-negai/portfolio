import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { uploadPowerPoint } from '../../api/powerpoints';
import { useAuth } from '../../hooks/useAuth';
import './PowerPointUpload.css';

const PowerPointUpload = () => {
  const navigate = useNavigate();
  const { portfolioId } = useParams();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    file: null,
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (file) {
      // PowerPointファイルの拡張子をチェック
      const allowedTypes = [
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];
      const allowedExtensions = ['.ppt', '.pptx'];
      
      const isValidType = allowedTypes.includes(file.type) || 
                         allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      
      if (!isValidType) {
        setError('PowerPointファイル（.ppt, .pptx）のみアップロード可能です');
        return;
      }

      // ファイルサイズチェック（50MB制限）
      if (file.size > 50 * 1024 * 1024) {
        setError('ファイルサイズは50MB以下にしてください');
        return;
      }

      setFormData(prev => ({
        ...prev,
        file: file
      }));
      setError(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('PowerPointをアップロードするにはログインが必要です');
      return;
    }

    if (!formData.file) {
      setError('PowerPointファイルを選択してください');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await uploadPowerPoint(portfolioId, formData.file, formData.description);
      navigate(`/portfolios/${portfolioId}`);
    } catch (err) {
      setError('PowerPointのアップロードに失敗しました');
      console.error('PowerPoint upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="powerpoint-upload-container">
        <div className="powerpoint-upload-error">
          PowerPointをアップロードするにはログインが必要です
        </div>
      </div>
    );
  }

  return (
    <div className="powerpoint-upload-container">
      <div className="powerpoint-upload-form">
        <h1 className="powerpoint-upload-title">PowerPointファイルをアップロード</h1>
        
        {error && <div className="powerpoint-upload-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>PowerPointファイル *</label>
            <div 
              className={`file-drop-zone ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file"
                accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                onChange={handleFileChange}
                className="file-input"
              />
              <label htmlFor="file" className="file-label">
                {formData.file ? (
                  <div className="file-selected">
                    <span className="file-icon">📄</span>
                    <span className="file-name">{formData.file.name}</span>
                    <span className="file-size">
                      ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                ) : (
                  <div className="file-placeholder">
                    <span className="upload-icon">📁</span>
                    <span>PowerPointファイルをドラッグ&ドロップ<br />またはクリックして選択</span>
                    <span className="file-types">対応形式: .ppt, .pptx (最大50MB)</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">説明（任意）</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="PowerPointファイルの説明を入力"
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate(`/portfolios/${portfolioId}`)}
              disabled={loading}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading || !formData.file}
            >
              {loading ? 'アップロード中...' : 'アップロード'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PowerPointUpload;