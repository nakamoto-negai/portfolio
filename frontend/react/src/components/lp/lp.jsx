import { useState, useEffect, use } from 'react';
import './lp.css';
import { logoutUser } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth'; 
import { fetchUsers } from '../../api/users';
import { useNavigate } from 'react-router-dom';

const Lpsite = () => {
  const { user, loading, setUser } = useAuth();
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // ユーザー一覧を取得するAPIを呼び出す
    fetchUsers().then((res) => setUsers(res.data));
  }, []);

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
      case 'login':
        // ログインページへ遷移
        window.location.href = '/login';
        break;
      case 'register':
        // 新規登録ページへ遷移
        window.location.href = '/register';   
        break;
      case 'messages':
        // メッセージページへ遷移
        window.location.href = '/messages';
        break;
      case 'home':
        // ホームページへ遷移
        window.location.href = '/';
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

  if (loading) {
    return <div>Loading...</div>; // ローディング中の表示
  }

  return (
    <div className="portfolio-container">
      <header className="header">
        <h1 className="title">PORTFOLIO.TSX</h1>
        <div className="user-id">
          {user ? (
            <div>
              <span className="nav-link"
                    onClick={() => handleNavigation('home')}
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