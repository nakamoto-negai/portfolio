import apiClient from './apiClient';

export const getPublishedPortfolios = async () => {
  try {
    const response = await apiClient.get('/api/portfolios/published');
    return response.data;
  } catch (error) {
    console.error('Error fetching published portfolios:', error);
    throw error;
  }
};

export const createPortfolio = async (portfolioData) => {
  try {
    const response = await apiClient.post('/api/portfolios', {
      portfolio: portfolioData
    });
    return response.data;
  } catch (error) {
    console.error('Error creating portfolio:', error);
    throw error;
  }
};

export const getMyPortfolios = async () => {
  try {
    const response = await apiClient.get('/api/portfolios/my');
    return response.data;
  } catch (error) {
    console.error('Error fetching my portfolios:', error);
    throw error;
  }
};