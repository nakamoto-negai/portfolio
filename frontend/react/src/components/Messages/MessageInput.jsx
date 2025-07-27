import { useState } from "react";
import { postMessage } from "../../api/messages";
import "./MessageInput.css";

const MessageInput = ({ partnerId, onMessageSent }) => {
  const [text, setText] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await postMessage(partnerId, text.trim());
    setText("");
    // メッセージ送信後のコールバックを呼ぶ
    if (onMessageSent) {
      onMessageSent();
    }
  };

  return (
    <form onSubmit={submit} className="message-input-form">
      <input
        className="message-input-field"
        placeholder="メッセージを入力してください"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button className="message-send-button">➤</button>
    </form>
  );
};

export default MessageInput;
