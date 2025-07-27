// hooks/useMessages.js
import { useEffect, useRef, useState } from "react";
import { cable } from "../lib/cable";
import { fetchMessages } from "../api/messages";

export const useMessages = (myId, partnerIdRaw) => {
  const partnerId = Number(partnerIdRaw) || null;
  const [messages, setMessages] = useState([]);          // ← 初期値 []

  /* 過去メッセージ */
  useEffect(() => {
    if (!partnerId) return;                              // id が無ければスキップ
    fetchMessages(partnerId)
      .then((arr) => setMessages(Array.isArray(arr) ? arr : []))
      .catch((e) => { console.error(e); setMessages([]); });
  }, [partnerId]);

  /* リアルタイム購読 */
  const subRef = useRef(null);
  useEffect(() => {
    if (!myId || !partnerId) return;
    const room = `room_${[myId, partnerId].sort().join("_")}`;
    subRef.current = cable.subscriptions.create(
      { channel: "ChatChannel", room },
      { received: (msg) => setMessages((prev) => [...prev, msg]) }
    );
    return () => subRef.current && cable.subscriptions.remove(subRef.current);
  }, [myId, partnerId]);

  return messages;                                       // ← 必ず配列
};