
import { useEffect, useState } from "react";
import { fetchConversations } from "../../api/messages";
import ConversationItem from "./ConversationItem";
import "./Sidebar.css";

const Sidebar = ({ activeId, onSelect }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchConversations().then(res => setUsers(res.data));
  }, []);

  return (
    <aside className="sidebar">
      <h1 className="sidebar-title">portfolio</h1>
      <h2 className="sidebar-subtitle">requests</h2>
      <ul className="conversation-list">
        {(users || []).map((u) => (
          <ConversationItem
            key={u.id}
            user={u}
            active={u.id === activeId}
            onClick={() => onSelect(u)}
          />
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
