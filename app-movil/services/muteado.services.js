import axios from './api.js';

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
      console.log("Usuario desmuteado: en services", response.data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al desmutear usuario');
    }
  },
  // Obtener estado de muteo de un usuario
  obtenerEstadoMuteo: async (userId) => {
    try {
      const response = await axios.get(`/muteo/estado-muteo/${userId}`);
      console.log("Estado de muteo obtenido: en services", response.data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener estado de muteo');
    }
  }
};