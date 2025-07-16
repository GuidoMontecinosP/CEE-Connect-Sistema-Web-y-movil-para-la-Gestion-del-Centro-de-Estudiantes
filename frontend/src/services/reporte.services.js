import axios from './root.services.js';

export const reportesService = {
  // Crear nuevo reporte (cualquier usuario autenticado)
  crearReporte: async (sugerenciaId, motivo) => {
    try {
      const response = await axios.post('/reportes', {
        sugerenciaId,
        motivo
      });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.errors?.[0] || error.response?.data?.mensaje || 'Error al crear reporte';
      throw new Error(msg);
    }
  },

  // Obtener todos los reportes con paginación (solo admin)
  obtenerReportes: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`/reportes?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener reportes');
    }
  },

  // Eliminar reporte por ID (solo admin)
  eliminarReporte: async (id) => {
    try {
      const response = await axios.delete(`/reportes/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al eliminar reporte');
    }
  },
async obtenerMisReportes() {
    const response = await axios.get('/reportes/mis-reportes');
    console.log(response); 
    return response.data;
  },
  // Vaciar todos los reportes de una sugerencia específica (solo admin)
  vaciarReportesDeSugerencia: async (sugerenciaId) => {
    try {
      const response = await axios.delete(`/reportes/sugerencia/${sugerenciaId}/vaciar`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al vaciar reportes de la sugerencia');
    }
  }
};