import axios from './root.services.js';

export const obtenerEventos = async () => {
    try {
        const response = await axios.get('/eventos/eventos');
        
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.mensaje || 'Error al obtener eventos');
    }
};

export const crearEvento = async (evento) => {
    // eslint-disable-next-line no-useless-catch
    try {
        const response = await axios.post('/eventos/crearEvento', evento, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error
    }
};

export const modificarEvento = async (id, evento) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await axios.put(`/eventos/modificarEvento/${id}`, evento, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    return response.data;
  } catch (error) {
    
    throw error;
  }
};

export const eliminarEvento = async (id) => {
    try {
        const response = await axios.delete(`eventos/eliminarEvento/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.mensaje || 'Error al eliminar el evento');
    }
};