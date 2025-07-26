import { useState, useEffect, use } from 'react';
import './lp.css';
import { logoutUser } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth'; 
import { fetchUsers } from '../../api/users';
import { useNavigate } from 'react-router-dom';
import ProfileSidebar from '../Profile/ProfileSidebar';

const Lpsite = () => {
  const { user, loading, setUser } = useAuth();
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // ユーザー一覧を取得するAPIを呼び出す
    fetchUsers().then((res) => setUsers(res.data));
  }, []);

  const handleProfileMenuClick = () => {
    setIsProfileSidebarOpen(true);
  };

  const handleProfileSidebarClose = () => {
    setIsProfileSidebarOpen(false);
  };

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
      case 'messages':
        // メッセージページへ遷移
        navigate('/messages')
        break;
      case 'home':
        // ホームページへ遷移
        navigate('/')
        break;
      default:
        break;
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null); // ログアウト後にユーザー情報をクリア
      window.location.href = '/'; // ホームへリダイレクト
    } catch (err) {
      console.error('ログアウト失敗:', err.response?.data || err.message);
    }
  };


  
  
  return (
    <div className="portfolio-container">
      <header className="header">
        <h1 className="title">PORTFOLIO.TSX</h1>
        {/* 三点リーダーメニューボタン（ログイン時のみ表示） */}
        {user && (
          <button className="menu-button" onClick={handleProfileMenuClick}>
            ⋯
          </button>
        )}
        <div className="user-id">
          {user ? (
            <div>
              <span className="nav-link"
                onClick={() => handleNavigation(`/users/${user.id}`)}
              >
                {user.name}
              </span>
              <span className="separator">|</span>
              <span className="nav-link" 
                    onClick={() => handleNavigation('messages')}
              >
                messages
              </span>      
              <span className="separator">|</span>
              <span className="nav-link" onClick={handleLogout}>
                logout
              </span>
            </div>
          ) : (
            <div>
              <span className="nav-link" 
                    onClick={() => handleNavigation('messages')}
              >
                messages
              <span className="separator">|</span>
              </span>  
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
      
      {/* プロフィールサイドバー */}
      <ProfileSidebar 
        isOpen={isProfileSidebarOpen}
        onClose={handleProfileSidebarClose}
        userId={user?.id}
        currentUser={user}
      />
      
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
          <h1>ようこそ {user?.name} さん</h1>
          <h2>チャット可能なユーザー一覧</h2>
          <ul>
            {users.map((u) => (
              <li key={u.id}>
                <button onClick={() => navigate(`/messages?partner_id=${u.id}`)}>
                  {u.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Lpsite;