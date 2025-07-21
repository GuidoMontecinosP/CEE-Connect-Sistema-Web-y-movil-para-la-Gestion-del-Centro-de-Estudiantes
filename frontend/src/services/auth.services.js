import axios from './root.services.js';

export const authService = {

    restablecerContrasena: async (token, nuevaContrasena) => { // Cambiar nombre del parámetro
    try {
        const response = await axios.post(`/auth/restablecer/${token}`, { nuevaContrasena }); // Coincidir con backend
        return response.data;
    } catch (error) {
        const msg = error.response?.data.details || 'Error al restablecer la contraseña';
        throw new Error(msg);
    }
}
,
    verificarTokenRecuperacion: async (token) => {
        try {
            const response = await axios.get(`/auth/verificar-token/${token}`);
            return response.data;
        } catch (error) {
            //console.log('Error en verificarTokenRecuperacion:', error.response?.data.errors);
            const msg = error.response?.data.errors || error.response?.data.details || 'Error al verificar el token de recuperación';
            throw new Error(msg);
        }
    },
    recuperarContrasena: async (correo) => {
        try {
            const response = await axios.post('/auth/recuperar' ,correo );
            console.log('Correo enviado:', response.data);
            return response.data;
        } catch (error) {
            //console.log('Error en recuperarContrasena:', error.response?.data.errors);
            const msg = error.response?.data.errors || error.response?.data.details || 'Error al enviar el correo de recuperación';
            throw new Error(msg);
        }
    }

}