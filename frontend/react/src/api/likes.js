import apiClient from './apiClient';

export const likesApi = {
  // いいねする
  like: async (portfolioId) => {
    try {
      const response = await apiClient.post(`/portfolios/${portfolioId}/likes`);
      return response.data;
    } catch (error) {
      console.error('Like error:', error);
      throw error;
    }
  },

  // いいねを取り消す
  unlike: async (portfolioId) => {
    try {
      const response = await apiClient.delete(`/portfolios/${portfolioId}/likes`);
      return response.data;
    } catch (error) {
      console.error('Unlike error:', error);
      throw error;
    }
  },

  // いいね状況を取得
  getStatus: async (portfolioId) => {
    try {
      const response = await apiClient.get(`/portfolios/${portfolioId}/likes/status`);
      return response.data;
    } catch (error) {
      console.error('Get like status error:', error);
      throw error;
    }
  },

  // いいねをトグル（いいねしてたら取り消し、してなかったらいいね）
  toggle: async (portfolioId) => {
    try {
      // まず現在の状態を取得
      const status = await likesApi.getStatus(portfolioId);
      
      // 状態に応じていいね/取り消しを実行
      if (status.liked) {
        return await likesApi.unlike(portfolioId);
      } else {
        return await likesApi.like(portfolioId);
      }
    } catch (error) {
      console.error('Toggle like error:', error);
      throw error;
    }
  }
};

export default likesApi;