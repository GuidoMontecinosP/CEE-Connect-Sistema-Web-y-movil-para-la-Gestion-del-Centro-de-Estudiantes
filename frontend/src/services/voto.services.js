import axios from './root.services.js';

export const votoService = {
  // Emitir voto 
  emitirVoto: async (usuarioId, votacionId, opcionId) => {
  try {
    const response = await axios.post(`/votacion/${votacionId}/votar`, {
      usuarioId,
      opcionId
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.mensaje || 'Error al emitir voto');
  }
}
,

  // Verificar si el usuario ya votó
  verificarSiYaVoto: async (usuarioId, votacionId) => {
    try {
      const response = await axios.get(`/votacion/${votacionId}/mi-voto/${usuarioId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || 'Error al verificar estado de voto');
    }
  }
};
