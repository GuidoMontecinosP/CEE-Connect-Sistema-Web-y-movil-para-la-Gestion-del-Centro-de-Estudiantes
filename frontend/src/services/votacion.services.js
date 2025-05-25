import axios from './root.services.js';

export const getVotaciones = async () => {
    try {
        const response = await axios.get('/votaciones');
        console.log('Votaciones:', response.data);

        return response.data;
    } catch (error) {
        console.error('Error fetching votaciones:', error);
        throw error;
    }
}
export const crearVotacion = async (votacionData) => {
    try {
        const response = await axios.post('/votaciones', votacionData);
        console.log('Votacion creada:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating votacion:', error);
        throw error;
    }
}
export const getVotacionPorId = async (id) => {
    try {
        const response = await axios.get(`/votaciones/${id}`);
        console.log('Votacion por ID:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching votacion by ID:', error);
        throw error;
    }
}