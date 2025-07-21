import axios from "./root.services.js";
import Cookies from "js-cookie";

export const obtenerAnuncios = async () => {
    const token = Cookies.get('token');
    try {
        const response = await axios.get(
            '/anuncios/anuncios',
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.mensaje || 'Error al obtener anuncios');
    }
};

export const crearAnuncio = async (anuncio) => {
    const token = Cookies.get('token');
    try {
        const response = await axios.post(
            '/anuncios/crearAnuncio',
            anuncio,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        // Mostrar mensaje detallado del backend si existe
        const mensaje = error.response?.data?.message || error.response?.data?.mensaje || error.message || 'Error al crear anuncio';
        throw new Error(mensaje);
    }
};

export const modificarAnuncio = async (id, anuncio) => {
    const token = Cookies.get('token');
    const response = await axios.put(
        `/anuncios/modificarAnuncio/${id}`,
        anuncio,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};

export const eliminarAnuncio = async (id) => {
    const token = Cookies.get('token');
    const response = await axios.delete(
        `/anuncios/eliminarAnuncio/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
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