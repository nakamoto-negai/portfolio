import { useState } from "react";
import Sidebar from "./Sidebar";
import Test_ChatWindow from "./ChatWindow";
import { useAuth } from "../../hooks/useAuth";
import "./MessagesPage.css";

const MessagesPage = () => {
  const { user, loading } = useAuth();
  const [partner, setPartner] = useState(null);

  if (loading) return null;
  if (!user) return <p className="login-warning">ログインしてください</p>;

  return (
    <div className="messages-page">
      <Sidebar activeId={partner?.id ?? null} onSelect={setPartner} />
      <div className="chat-area">
        {partner ? (
          <Test_ChatWindow myId={user.id} partner={partner} />
        ) : (
          <p className="chat-placeholder">左のリストから会話を選択してください</p>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
