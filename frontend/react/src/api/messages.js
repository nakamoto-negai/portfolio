import apiClient from './apiClient';

// チャット関連API
// ユーザー一覧API
export const fetchConversations = () =>
   // ユーザー一覧 or 会話相手一覧
  apiClient.get('/conversations');

// メッセージ一覧API
export const fetchMessages = (partnerId) =>
  apiClient.get(`/conversations/${partnerId}/messages`);

// メッセージ送信API
export const postMessage = (partnerId, content) =>
  apiClient.post(`/conversations/${partnerId}/messages`, { content });