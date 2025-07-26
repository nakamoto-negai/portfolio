import clsx from "clsx";
import "./ConversationItem.css";

const ConversationItem = ({ user, active, onClick }) => (
  <li
    onClick={onClick}
    className={clsx(
      "conversation-item",
      active && "conversation-item--active"
    )}
  >
    {user.name}
  </li>
);

export default ConversationItem;
