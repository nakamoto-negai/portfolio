import React from "react";
import clsx from "clsx";
import "./MessageBubble.css";

const MessageBubble = ({ msg, isMe }) => (
  <div className={clsx("message-container", isMe ? "me" : "other")}>
    <div className={clsx("message-bubble", isMe ? "me" : "other")}>
      {msg.content}
    </div>
  </div>
);

export default MessageBubble;
