import axios from './root.services.js';

export const crearOpciones = async (opcionData) => {
    try {
        const response = await axios.post('/opciones', opcionData);
        console.log('Opción creada:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creando opción:', error);
        throw error;
    }
}