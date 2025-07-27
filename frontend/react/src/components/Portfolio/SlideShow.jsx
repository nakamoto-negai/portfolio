import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPortfolio, getPortfolioSlides } from '../../api/portfolios';
import './SlideShow.css';

// 画像URLを正規化する関数
const normalizeImageUrl = (url) => {
  if (!url) return null;
  
  // 既にフルURLの場合はそのまま返す
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // 相対パスの場合はベースURLを追加
  const baseUrl = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
  return `${baseUrl.replace(/\/+$/, '')}${url.startsWith('/') ? url : '/' + url}`;
};

const SlideShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          previousSlide();
          break;
        case 'ArrowRight':
          nextSlide();
          break;
        case 'Escape':
          if (isFullscreen) {
            exitFullscreen();
          }
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, isFullscreen]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [portfolioRes, slidesRes] = await Promise.all([
        getPortfolio(id),
        getPortfolioSlides(id)
      ]);
      
      console.log('Portfolio response:', portfolioRes.data);
      console.log('Slides response:', slidesRes.data);
      
      setPortfolio(portfolioRes.data);
      setSlides(slidesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.response?.data?.error || 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const previousSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (loading) {
    return (
      <div className="slideshow-container">
        <div className="loading-wrapper">
          <div className="loading-spinner"></div>
          <p className="loading-text">スライドを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="slideshow-container">
        <div className="error-wrapper">
          <p className="error-text">エラー: {error}</p>
          <button onClick={() => navigate('/contact')} className="back-button">
            一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  if (!slides.length) {
    return (
      <div className="slideshow-container">
        <div className="error-wrapper">
          <p className="error-text">スライドが見つかりません</p>
          <button onClick={() => navigate('/contact')} className="back-button">
            一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  const currentSlideData = slides[currentSlide];

  return (
    <div className={`slideshow-container ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Header */}
      <header className="slideshow-header">
        <div className="header-left">
          <button onClick={() => navigate('/contact')} className="back-button">
            <svg className="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 12H5"></path>
              <polyline points="12,19 5,12 12,5"></polyline>
            </svg>
            一覧に戻る
          </button>
          <h1 className="slideshow-title">{portfolio?.title}</h1>
        </div>
        
        <div className="header-controls">
          <span className="slide-counter">
            {currentSlide + 1} / {slides.length}
          </span>
          <button onClick={toggleFullscreen} className="fullscreen-button">
            <svg className="fullscreen-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
            </svg>
          </button>
        </div>
      </header>

      {/* Main Slide Area */}
      <div className="slide-main">
        <button 
          onClick={previousSlide} 
          className="nav-button nav-prev"
          disabled={slides.length <= 1}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
        </button>

        <div className="slide-content">
          {currentSlideData?.image_url ? (
            <img 
              src={normalizeImageUrl(currentSlideData.image_url)} 
              alt={`スライド ${currentSlide + 1}`}
              className="slide-image"
              onError={(e) => {
                console.error('Image failed to load:', currentSlideData.image_url);
                e.target.style.display = 'none';
                const nextElement = e.target.nextSibling;
                if (nextElement) {
                  nextElement.style.display = 'flex';
                }
              }}
            />
          ) : null}
          
          <div 
            className="slide-placeholder" 
            style={{ display: currentSlideData?.image_url ? 'none' : 'flex' }}
          >
            <svg className="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21,15 16,10 5,21"></polyline>
            </svg>
            <p>画像が見つかりません</p>
            {currentSlideData?.image_url && (
              <p className="debug-url">URL: {currentSlideData.image_url}</p>
            )}
          </div>
        </div>

        <button 
          onClick={nextSlide} 
          className="nav-button nav-next"
          disabled={slides.length <= 1}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>
      </div>

      {/* Slide Thumbnails */}
      {slides.length > 1 && (
        <div className="slide-thumbnails">
          <div className="thumbnails-container">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(index)}
                className={`thumbnail ${index === currentSlide ? 'active' : ''}`}
              >
                {slide.image_url ? (
                  <img 
                    src={normalizeImageUrl(slide.image_url)} 
                    alt={`スライド ${index + 1}`}
                    className="thumbnail-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const nextElement = e.target.nextSibling;
                      if (nextElement) {
                        nextElement.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                
                <div 
                  className="thumbnail-placeholder"
                  style={{ display: slide.image_url ? 'none' : 'flex' }}
                >
                  <span>{index + 1}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="shortcuts-help">
        <p>キーボードショートカット: ← → (ナビゲーション) | F (フルスクリーン) | ESC (終了)</p>
      </div>
    </div>
  );
};

export default SlideShow;