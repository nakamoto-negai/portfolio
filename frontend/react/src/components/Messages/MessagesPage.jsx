import { useState, useEffect, use } from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import { useAuth } from "../../hooks/useAuth";
import "./MessagesPage.css";
import { useSearchParams } from "react-router-dom";
import { fetchUserById } from "../../api/users";

const MessagesPage = () => {
  const { user, loading } = useAuth();
  const [partner, setPartner] = useState(null);
  const [refreshSidebar, setRefreshSidebar] = useState(0);
  const [searchParams] = useSearchParams();
  const partnerId = searchParams.get("partner_id");

  useEffect(() => {
    if (partnerId) {
      // ここでAPIを呼び出してパートナーの情報を取得する
      fetchUserById(partnerId)
        .then((res) => setPartner(res.data))
        .catch(() => setPartner(null));
    }
  }, [partnerId]);

  // メッセージ送信後にサイドバーをリフレッシュする関数
  const handleMessageSent = () => {
    setRefreshSidebar(prev => prev + 1);
  };
  
  if (!user) return <p className="login-warning">ログインしてください</p>;

  return (
    <div className="messages-page">
      <Sidebar 
        activeId={partner?.id ?? null} 
        onSelect={setPartner} 
        refreshTrigger={refreshSidebar}
      />
      <div className="chat-area">
        {partner ? (
          <ChatWindow 
            myId={user.id} 
            partner={partner} 
            onMessageSent={handleMessageSent}
          />
        ) : (
          <p className="chat-placeholder">左のリストから会話を選択してください</p>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
