import axios from './root.services.js';

export const usuarioService = {
  
  obtenerUsuarios: async (parametros = {}) => {
    try {
      const { page = 1, limit = 10, rol, estado, search } = parametros;
      
      // Construir query string con parámetros
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('limit', limit);
      
      if (rol && rol !== 'all') queryParams.append('rol', rol);
      if (estado && estado !== 'all') queryParams.append('estado', estado);
      if (search) queryParams.append('search', search);
      
      const response = await axios.get(`/superadmin/usuarios?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
        console.log('Error al obtener usuarios:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al obtener usuarios');
    }
  },

  
  alternarRolUsuario: async (usuarioId) => {
    try {
        console.log('Cambiando rol de usuario:', usuarioId);
        usuarioId = parseInt(usuarioId, 10);
        console.log('Tipo de ID de usuario:', typeof usuarioId);
      const response = await axios.patch(`/superadmin/usuarios/${usuarioId}/cambiar`);
      console.log('Respuesta del servidor:', response.data);
      console.log('Rol de usuario cambiado exitosamente:', usuarioId);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al cambiar rol de usuario');
    }
  },

 
  obtenerEstadisticas: async () => {
    try {
      const response = await axios.get('/superadmin/estadisticas');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al obtener estadísticas');
    }
  }
};