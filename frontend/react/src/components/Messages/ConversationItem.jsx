import clsx from "clsx";
import "./ConversationItem.css";

const ConversationItem = ({ user, active, onClick }) => {
  // 最後のメッセージ時刻をフォーマット
  const formatLastMessage = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'たった今';
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  };

  return (
    <li
      onClick={onClick}
      className={clsx(
        "conversation-item",
        active && "conversation-item--active"
      )}
    >
      <div className="conversation-info">
        <div className="conversation-name">{user.name}</div>
        {user.last_message_at && (
          <div className="conversation-time">
            {formatLastMessage(user.last_message_at)}
          </div>
        )}
      </div>
    </li>
  );
};

export default ConversationItem;
