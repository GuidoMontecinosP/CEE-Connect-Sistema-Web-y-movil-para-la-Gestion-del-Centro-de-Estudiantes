import axios from './root.services.js';

export const obtenerEventos = async () => {
    try {
        const response = await axios.get('/eventos/eventos');
         console.log("Respuesta de eventos:", response.data);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.mensaje || 'Error al obtener eventos');
    }
};

export const crearEvento = async (evento) => {
    try {
        const response = await axios.post('/eventos/crearEvento', evento);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.mensaje || 'Error al crear el evento');
    }
};

export const modificarEvento = async (id, evento) => {
    try {
        const response = await axios.put(`/eventos/modificarEvento/${id}`, evento);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.mensaje || 'Error al modificar el evento');
    }
}

export const eliminarEvento = async (id) => {
    try {
        const response = await axios.delete(`/eventos/eliminarEvento/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.mensaje || 'Error al eliminar el evento');
    }
};