import axios from './root.services.js';

export const sugerenciasService = {
  // Crear nueva sugerencia
crearSugerencia: async (datos) => {
  try {
    const response = await axios.post('/sugerencias', datos);
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.errors?.[0] || error.response?.data?.mensaje || 'Error al crear sugerencia';
    throw new Error(msg);
  }
},

  // Obtener todas las sugerencias con filtros y paginación
  obtenerSugerencias: async (page = 1, limit = 10, categoria = null, estado = null) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (categoria) params.append('categoria', categoria);
      if (estado) params.append('estado', estado);

      const response = await axios.get(`/sugerencias?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener sugerencias');
    }
  },

  // Obtener sugerencia por ID
  obtenerSugerenciaPorId: async (id) => {
    try {
      const response = await axios.get(`/sugerencias/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener sugerencia');
    }
  },

  // Actualizar sugerencia
  actualizarSugerencia: async (id, titulo, mensaje, categoria, contacto) => {
    try {
      const response = await axios.patch(`/sugerencias/${id}`, {
        titulo,
        mensaje,
        categoria,
        contacto
      });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.errors?.[0] || error.response?.data?.mensaje || 'Error al actualizar sugerencia';
      throw new Error(msg);
    }
  },

  // Eliminar sugerencia
  eliminarSugerencia: async (id) => {
    try {
      const response = await axios.delete(`/sugerencias/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al eliminar sugerencia');
    }
  },

  // Obtener mis sugerencias
  obtenerMisSugerencias: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`/sugerencias/usuario/mis-sugerencias?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener mis sugerencias');
    }
  },

  // --- RUTAS DE ADMIN ---

  // Responder a una sugerencia (solo admin)
  responderSugerencia: async (id, respuesta, estado) => {
    try {
      const response = await axios.post(`/sugerencias/${id}/responder`, {
        respuesta,
        estado
      });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.errors?.[0] || error.response?.data?.mensaje || 'Error al responder sugerencia';
      throw new Error(msg);
    }
  },

  // Obtener sugerencias reportadas (solo admin)
  obtenerSugerenciasReportadas: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`/sugerencias/admin/reportadas?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener sugerencias reportadas');
    }
  },

  // Actualizar respuesta de administrador
  actualizarRespuestaAdmin: async (id, respuesta, estado) => {
    try {
      const response = await axios.put(`/sugerencias/${id}/respuesta`, {
        respuesta,
        estado
      });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.errors?.[0] || error.response?.data?.mensaje || 'Error al actualizar respuesta';
      throw new Error(msg);
    }
  },

  // Eliminar respuesta de administrador
  eliminarRespuestaAdmin: async (id) => {
    try {
      const response = await axios.delete(`/sugerencias/${id}/respuesta`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al eliminar respuesta');
    }
  },

  // Cambiar estado de sugerencia
  cambiarEstadoSugerencia: async (id, estado) => {
    try {
      const response = await axios.patch(`/sugerencias/${id}/estado`, {
        estado
      });
      return response.data;
    } catch (error) {
      const msg = error.response?.data?.errors?.[0] || error.response?.data?.mensaje || 'Error al cambiar estado';
      throw new Error(msg);
    }
  }
};