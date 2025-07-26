import { useEffect, useRef } from "react";
import { useMessages } from "../../hooks/useMessages";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import "./ChatWindow.css";

const ChatWindow = ({ myId, partner }) => {
  const messages = useMessages(myId, partner.id);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <section className="chat-window">
      <header className="chat-header">
        <h2 className="chat-partner-name">{partner.name}</h2>
        <p className="chat-subtitle">メッセージをしましょう</p>
      </header>

      <div className="chat-messages">
        {messages.map((m) => (
          <MessageBubble key={m.id} msg={m} isMe={m.sender_id === myId} />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area">
        <MessageInput partnerId={partner.id} />
      </div>
    </section>
  );
};

export default ChatWindow;
