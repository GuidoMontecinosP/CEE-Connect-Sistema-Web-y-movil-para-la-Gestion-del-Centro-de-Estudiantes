
import axios from './api.js';

export const votacionService = {
  // Obtener todas las votaciones
 obtenerVotaciones: async (parametros = {}) => {
    try {
      const {
        page = 1,
        limit = 10,
        estado = null,
        busqueda = null,
        resultadosPublicados = null
      } = parametros;

      // Construir query params dinámicamente
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      if (estado) queryParams.append('estado', estado);
      if (busqueda && busqueda.trim()) queryParams.append('busqueda', busqueda.trim());
      if (resultadosPublicados !== null) queryParams.append('resultadosPublicados', resultadosPublicados.toString());

      const response = await axios.get(`/votacion?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener votaciones');
    }
  },

  // Crear nueva votación 
  crearVotacion: async (titulo, opciones) => {
    try {
      const response = await axios.post('/votacion', {
        titulo,
        opciones // Array de strings con las opciones
      });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.errors?.[0] || 'Error desconocido';
      // Opcional: loguearlo
      throw new Error(msg);

    }
  },

  // Obtener votación por ID
  obtenerVotacionPorId: async (id) => {
    try {
      const response = await axios.get(`/votacion/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener votación');
    }
  },

  // Cerrar votación
  cerrarVotacion: async (votacionId) => {
    try {
      const response = await axios.patch(`/votacion/${votacionId}/cerrar`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al cerrar votación');
    }
  },

  // Obtener resultados de votación
  obtenerResultados: async (votacionId) => {
    try {
      const response = await axios.get(`/votacion/${votacionId}/resultados`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener resultados');
    }
  }
  // Obtener participantes de votación
  , obtenerParticipantes: async (votacionId) => {
    try {
      const response = await axios.get(`/votacion/${votacionId}/participantes`);
      //console.log(response.data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener participantes');
    }
  },
  publicarResultados: async (votacionId) => {
    try {
      const response = await axios.put(`/votacion/${votacionId}/publicar-resultados`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al publicar resultados');
    }
  }
};
