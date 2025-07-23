
import axios from "./root.services.js";

export const obtenerAnuncios = async () => {
    try {
        const response = await axios.get('/anuncios/anuncios',
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.mensaje || 'Error al obtener anuncios');
    }
};

export const crearAnuncio = async (anuncio) => {
   
    try {
        const response = await axios.post('/anuncios/crearAnuncio',anuncio,
        );
        return response.data;
    } catch (error) {
        // Mostrar mensaje detallado del backend si existe
        const mensaje = error.response?.data?.message || error.response?.data?.mensaje || error.message || 'Error al crear anuncio';
        throw new Error(mensaje);
    }
};

export const modificarAnuncio = async (id, anuncio) => {
    try {
        const response = await axios.put(`/anuncios/modificarAnuncio/${id}`, anuncio,
        );
        return response.data;
    } catch (error) {
        console.log(error);
        // Mostrar mensaje detallado del backend si existe
        const mensaje = error.response?.data?.message || error.response?.data?.mensaje || error.message || 'Error al modificar anuncio';
        throw new Error(mensaje);
    }
};

export const eliminarAnuncio = async (id) => {
    const response = await axios.delete(`/anuncios/eliminarAnuncio/${id}`,
       
    );
    return response.data;
};

export const obtenerNoticiasUBB = async () => {
    try {
        const response = await axios.get('/noticias');
        // console.log("Respuesta de noticias UBB:", response.data);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.mensaje || 'Error al obtener noticias de la UBB');
    }
}