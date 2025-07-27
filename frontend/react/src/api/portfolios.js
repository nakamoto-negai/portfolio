import apiClient from './apiClient';

// 全ポートフォリオ取得
export const getAllPortfolios = () =>
  apiClient.get('/portfolios');

// 公開ポートフォリオ一覧取得
export const getPublishedPortfolios = () =>
  apiClient.get('/portfolios/published');

// 自分のポートフォリオ一覧取得
export const getMyPortfolios = () =>
  apiClient.get('/portfolios/my');

// ポートフォリオ詳細取得
export const getPortfolio = (id) =>
  apiClient.get(`/portfolios/${id}`);

// ポートフォリオ作成 (FormDataを使用してファイルアップロード対応)
export const createPortfolio = (formData) => {
  return apiClient.post('/portfolios', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// ポートフォリオ更新
export const updatePortfolio = (id, portfolioData) =>
  apiClient.put(`/portfolios/${id}`, { portfolio: portfolioData });

// ポートフォリオ削除
export const deletePortfolio = (id) =>
  apiClient.delete(`/portfolios/${id}`);