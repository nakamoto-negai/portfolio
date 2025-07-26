import React from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigateをインポート
import './lp.css';
import { logoutUser } from '../../api/auth';

const Lpsite = ({ user }) => {
  const navigate = useNavigate(); // useNavigateフックを使用

  const handleNavigation = (section) => {
    // ここで各セクションに応じた処理を行う
    switch(section) {
      case 'show':
        // 魅せる - 作品ギャラリーページなど
        navigate('/gallery');
        break;
      case 'create':
        // 創る - SlideEditorページへ遷移
        navigate('/SlideEditor');
        break;
      case 'connect':
        // 繋がる - コンタクトページなど
        navigate('/contact');
        break;
      case 'login':
        // ログインページへ遷移
        navigate('/login');
        break;
      case 'register':
        // 新規登録ページへ遷移
        navigate('/register');   
        break;
      default:
        break;
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/'); // ログアウト後はホームページに遷移
      window.location.reload(); // ユーザー状態をリセットするためリロード
    } catch (err) {
      console.error('ログアウト失敗:', err.response?.data || err.message);
    }
  };

  return (
    <div className="portfolio-container">
      <header className="header">
        <h1 className="title">PORTFOLIO.TSX</h1>
        <div className="user-id">
          {user ? (
            <div>
              <span className="nav-link"
                    onClick={() => navigate('/')}
              >
                {user.name}
              </span>
              <span className="separator">|</span>
              <span className="nav-link"
                    onClick={handleLogout}
              >
                logout
              </span>
            </div>
          ) : (
            <div>
              <span className="nav-link" 
                    onClick={() => handleNavigation('login')}
              >
                login
              </span>
              <span className="separator">|</span>
              <span className="nav-link" 
                    onClick={() => handleNavigation('register')}
              >
                register
              </span>
            </div>
          ) }
        </div>
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