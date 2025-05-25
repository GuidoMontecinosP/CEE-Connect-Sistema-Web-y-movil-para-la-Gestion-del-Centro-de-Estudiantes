import axios from './root.services.js';

export const emitirVoto = async ({ usuarioId, votacionId, opcionId }) => {
    try {
        const response = await axios.post('/votar', {
            usuarioId,
            votacionId,
            opcionId
        });
        console.log('Voto emitido:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error al emitir voto:', error);
        throw error;
    }
}