import axios from './root.services.js';

export const muteoService = {
  // Mutear usuario (solo admin)
  mutearUsuario: async (userId, razon, fecha_fin) => {
    try {
      const response = await axios.post(`/muteo/${userId}`, {
        razon,
        fecha_fin
      });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.errors?.[0] || error.response?.data?.mensaje || 'Error al mutear usuario';
      throw new Error(msg);
    }
  },

  // Desmutear usuario (solo admin)
  desmutearUsuario: async (userId) => {
    try {
      const response = await axios.patch(`/muteo/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al desmutear usuario');
    }
  }
};