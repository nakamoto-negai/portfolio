import React from 'react';
import './lp.css';

const Lpsite = () => {
  const handleNavigation = (section) => {
    // ここで各セクションに応じた処理を行う
    switch(section) {
      case 'show':
        // 魅せる - 作品ギャラリーページなど
        window.location.href = '/gallery';
        break;
      case 'create':
        // 創る - 制作プロセスや技術ページなど
        window.location.href = '/works';
        break;
      case 'connect':
        // 繋がる - コンタクトページなど
        window.location.href = '/contact';
        break;
      default:
        break;
    }
  };

  return (
    <div className="portfolio-container">
      <header className="header">
        <h1 className="title">PORTFOLIO.TSX</h1>
        <div className="user-id">userId</div>
      </header>
      
      <main className="main-content">
        <div className="image-container">
          <img 
            src="/lpimg1.png" 
            alt="Portfolio workspace" 
            className="workspace-image"
          />
        </div>
        
        <div className="content-section">
          <h2 className="portfolio-heading">portfolio</h2>
          <div className="navigation-text">
            <span 
              className="nav-link" 
              onClick={() => handleNavigation('show')}
            >
              魅せる
            </span>
            <span className="separator">|</span>
            <span 
              className="nav-link" 
              onClick={() => handleNavigation('create')}
            >
              創る
            </span>
            <span className="separator">|</span>
            <span 
              className="nav-link" 
              onClick={() => handleNavigation('connect')}
            >
              繋がる
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Lpsite;