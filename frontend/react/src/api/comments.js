import apiClient from './apiClient';

export const getComments = (portfolioId) =>
  apiClient.get(`/portfolios/${portfolioId}/comments`);

export const createComment = (portfolioId, content) =>
  apiClient.post(`/portfolios/${portfolioId}/comments`, { comment: { content } });

export const updateComment = (portfolioId, commentId, content) =>
  apiClient.put(`/portfolios/${portfolioId}/comments/${commentId}`, { comment: { content } });

export const deleteComment = (portfolioId, commentId) =>
  apiClient.delete(`/portfolios/${portfolioId}/comments/${commentId}`);