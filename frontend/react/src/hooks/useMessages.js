import { useEffect, useRef, useState } from "react";
import { cable } from "../lib/cable";
import { fetchMessages } from "../api/messages";

export const useMessages = (myId, partnerId) => {
  const [messages, setMessages] = useState([]);
  const subRef = useRef(null);

  useEffect(() => {
    fetchMessages(partnerId).then(setMessages);
  }, [partnerId]);

  useEffect(() => {
    const room = `room_${[myId, partnerId].sort().join("_")}`;
    subRef.current = cable.subscriptions.create(
      { channel: "ChatChannel", room },
      { received: (msg) => setMessages((prev) => [...prev, msg]) }
    );
    return () => cable.subscriptions.remove(subRef.current);
  }, [myId, partnerId]);

  return messages;
};