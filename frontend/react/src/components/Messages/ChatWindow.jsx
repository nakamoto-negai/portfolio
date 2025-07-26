import { useEffect, useRef } from "react";
import { useMessages } from "../../hooks/useMessages";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import "./ChatWindow.css";

const ChatWindow = ({ myId, partner }) => {
  // partner がまだ null（URL直アクセス直後など）の場合は空表示
  if (!partner?.id) return <p className="chat-window">Loading…</p>;

  // hook からメッセージ配列を取得（内部で必ず配列に整形している想定）
  const messages = useMessages(myId, partner.id) || [];
  const bottomRef = useRef(null);

  /* ---------- デバッグログ ---------- */
  useEffect(() => {
    console.log("messages state =", messages, "type =", typeof messages);
  }, [messages]);

  useEffect(() => {
  console.log("messages length =", messages.length);
  }, [messages]);

  /* ---------- 新着スクロール ---------- */
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <section className="chat-window">
      {/* ───── ヘッダ ───── */}
      <header className="chat-header">
        <h2 className="chat-partner-name">{partner.name}</h2>
        <p className="chat-subtitle">メッセージをしましょう</p>
      </header>

      {/* ───── メッセージ一覧 ───── */}
      <div className="chat-messages">
        {messages.map((m) => (
          <MessageBubble key={m.id} msg={m} isMe={m.sender_id === myId} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ───── 入力欄 ───── */}
      <div className="chat-input-area">
        <MessageInput partnerId={partner.id} />
      </div>
    </section>
  );
};

export default ChatWindow;