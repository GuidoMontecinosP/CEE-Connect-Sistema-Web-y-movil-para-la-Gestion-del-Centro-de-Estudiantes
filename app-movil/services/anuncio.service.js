import axios from './api.js';

export const anuncioService = {
    obtenerAnuncios: async () => {
        
        try {
            const response = await axios.get('/anuncios/anuncios');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.mensaje || 'Error al obtener anuncios');
        }
    },

    obtenerAnuncioPorId: async (id) => {
        try {
            const response = await axios.get(`/anuncios/anuncio/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.mensaje || 'Error al obtener el anuncio');
        }
    },

    crearAnuncio: async (anuncio) => {
        try {
            
            const response = await axios.post('/anuncios/crearAnuncio', anuncio, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            const mensaje = error.response?.data?.message || error.response?.data?.mensaje || error.message || 'Error al crear anuncio';
            throw new Error(mensaje);
        }
    },

    modificarAnuncio: async (id, anuncio) => {
        try {
            
            const response = await axios.put(`/anuncios/modificarAnuncio/${id}`, anuncio, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            const mensaje = error.response?.data?.message || error.response?.data?.mensaje || error.message || 'Error al modificar anuncio';
            throw new Error(mensaje);
        }
    },

    eliminarAnuncio: async (id) => {
        try {
            const response = await axios.delete(`/anuncios/eliminarAnuncio/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.mensaje || 'Error al eliminar el anuncio');
        }
    }
}