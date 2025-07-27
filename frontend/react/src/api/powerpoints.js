import apiClient from './apiClient';

export const uploadPowerPoint = async (portfolioId, file, description = '') => {
  try {
    const formData = new FormData();
    formData.append('powerpoint[file]', file);
    formData.append('powerpoint[description]', description);
    formData.append('powerpoint[original_filename]', file.name);

    const response = await apiClient.post(`/portfolios/${portfolioId}/powerpoints`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading PowerPoint:', error);
    throw error;
  }
};

export const getPowerPoints = async (portfolioId) => {
  try {
    const response = await apiClient.get(`/portfolios/${portfolioId}/powerpoints`);
    return response.data;
  } catch (error) {
    console.error('Error fetching PowerPoints:', error);
    throw error;
  }
};

export const deletePowerPoint = async (portfolioId, powerPointId) => {
  try {
    const response = await apiClient.delete(`/portfolios/${portfolioId}/powerpoints/${powerPointId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting PowerPoint:', error);
    throw error;
  }
};