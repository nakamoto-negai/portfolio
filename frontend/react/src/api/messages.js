import apiClient from './apiClient';

// チャット関連API
// ユーザー一覧API
export const fetchConversations = () =>
   // ユーザー一覧 or 会話相手一覧
  apiClient.get('/api/conversations');

// メッセージ一覧API
export const fetchMessages = (partnerId) =>
  apiClient.get(`/api/conversations/${partnerId}/messages`).then((res) => res.data);

// メッセージ送信API
export const postMessage = (partnerId, content) =>
  apiClient.post(`/api/conversations/${partnerId}/messages`, { content });