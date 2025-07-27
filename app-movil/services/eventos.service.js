import axios from './api.js';

export const eventosService = {

    obtenerEventos: async () => {
        try {
            const response = await axios.get('/eventos/eventos');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.mensaje || 'Error al obtener eventos');
        }
    },

    obtenerEventoPorId: async (id) => {
        try {
            const response = await axios.get(`/eventos/evento/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.mensaje || 'Error al obtener el evento');
        }
    },

    crearEvento: async (evento) => {
        try {
            const response = await axios.post('/eventos/crearEvento', evento, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.mensaje || 'Error al crear evento');
        }
    },

    modificarEvento: async (id, evento) => {
        try {
            const response = await axios.put(`/eventos/modificarEvento/${id}`, evento, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.mensaje || 'Error al modificar evento');
        }
    },

    eliminarEvento: async (id) => {
        try {
            const response = await axios.delete(`/eventos/eliminarEvento/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.mensaje || 'Error al eliminar el evento');
        }
    }
}
