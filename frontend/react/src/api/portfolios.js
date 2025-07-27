import apiClient from './apiClient';

export const fetchMyPortfolios = async () => {
  try {
    console.log('Making API request to /portfolios/my');
    const response = await apiClient.get('/portfolios/my');
    console.log('API response:', response);
    return response.data;
  } catch (error) {
    console.error('API request failed:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

export const fetchPublishedPortfolios = async () => {
  try {
    console.log('Making API request to /portfolios/published');
    const response = await apiClient.get('/portfolios/published');
    console.log('Published portfolios API response:', response);
    return response.data;
  } catch (error) {
    console.error('Published portfolios API request failed:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

export const createPortfolio = async (portfolioData) => {
  const response = await apiClient.post('/portfolios', { portfolio: portfolioData });
  return response.data;
};

export const createPortfolioWithFiles = async (portfolioData, files) => {
  const formData = new FormData();
  
  // ポートフォリオデータを追加
  Object.keys(portfolioData).forEach(key => {
    formData.append(`portfolio[${key}]`, portfolioData[key]);
  });
  
  // ファイルを追加
  files.forEach((file) => {
    formData.append('powerpoint_files[]', file);
  });

  const response = await apiClient.post('/portfolios', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const updatePortfolio = async (id, portfolioData) => {
  const response = await apiClient.put(`/portfolios/${id}`, { portfolio: portfolioData });
  return response.data;
};

export const deletePortfolio = async (id) => {
  const response = await apiClient.delete(`/portfolios/${id}`);
  return response.data;
};

export const fetchPortfolio = async (id) => {
  const response = await apiClient.get(`/portfolios/${id}`);
  return response.data;
};