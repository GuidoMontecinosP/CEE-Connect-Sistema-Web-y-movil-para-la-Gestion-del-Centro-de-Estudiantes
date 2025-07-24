import axios from './root.services.js';

export const votacionService = {
  // Obtener todas las votaciones con paginación y filtros
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

  // Función específica para búsqueda (wrapper más semántico)
  buscarVotaciones: async (termino, parametros = {}) => {
    return await votacionService.obtenerVotaciones({
      ...parametros,
      busqueda: termino
    });
  },

  // Función específica para filtrar por estado
  obtenerVotacionesPorEstado: async (estado, parametros = {}) => {
    return await votacionService.obtenerVotaciones({
      ...parametros,
      estado: estado
    });
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
      const msg = error.response?.data?.errors?.[0] || 
                  error.response?.data?.message || 
                  'Error desconocido';
      throw new Error(msg);
    }
  },

  // Obtener votación por ID
  obtenerVotacionPorId: async (id) => {
    try {
      const response = await axios.get(`/votacion/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener votación');
    }
  },

  // Cerrar votación
  cerrarVotacion: async (votacionId) => {
    try {
      const response = await axios.patch(`/votacion/${votacionId}/cerrar`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al cerrar votación');
    }
  },

  // Obtener resultados de votación
  obtenerResultados: async (votacionId) => {
    try {
      const response = await axios.get(`/votacion/${votacionId}/resultados`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener resultados');
    }
  },

  // Obtener participantes de votación con paginación y búsqueda
  obtenerParticipantes: async (votacionId, parametros = {}) => {
    try {
      const {
        page = 1,
        limit = 20,
        busqueda = null
      } = parametros;

      // Construir query params
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      if (busqueda && busqueda.trim()) {
        queryParams.append('busqueda', busqueda.trim());
      }

      const response = await axios.get(`/votacion/${votacionId}/participantes?${queryParams.toString()}`);
      console.log('Participantes obtenidos:', response.data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener participantes');
    }
  },

  // Buscar participantes específicamente
  buscarParticipantes: async (votacionId, termino, parametros = {}) => {
    return await votacionService.obtenerParticipantes(votacionId, {
      ...parametros,
      busqueda: termino
    });
  },

  // Publicar resultados
  publicarResultados: async (votacionId) => {
    try {
      const response = await axios.put(`/votacion/${votacionId}/publicar-resultados`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al publicar resultados');
    }
  },

  // Funciones auxiliares para el frontend

  // Obtener votaciones activas (wrapper semántico)
  obtenerVotacionesActivas: async (parametros = {}) => {
    return await votacionService.obtenerVotacionesPorEstado('activa', parametros);
  },

  // Obtener votaciones cerradas
  obtenerVotacionesCerradas: async (parametros = {}) => {
    return await votacionService.obtenerVotacionesPorEstado('cerrada', parametros);
  },

  // Obtener votaciones cerradas con resultados publicados
  obtenerVotacionesPublicadas: async (parametros = {}) => {
    return await votacionService.obtenerVotaciones({
      ...parametros,
      estado: 'cerrada',
      resultadosPublicados: true
    });
  },

  // Obtener votaciones cerradas sin publicar
  obtenerVotacionesSinPublicar: async (parametros = {}) => {
    return await votacionService.obtenerVotaciones({
      ...parametros,
      estado: 'cerrada',
      resultadosPublicados: false
    });
  }
};