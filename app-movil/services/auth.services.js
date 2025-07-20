import axios from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const login = async (correo, password) => {
  try {
    const res = await axios.post('/auth/login', { correo, contrasena: password });
    const { token, user } = res.data.data;

    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));

    return { token, user };
  } catch (error) {
    
    const msg = error.response?.data?.details;
    throw new Error(msg);
  }
};

export const register = async (nombre, correo, contrasena) => {
  try {
    const res = await axios.post('/auth/register', {
      nombre,
      correo,
      contrasena,
      rolId: 2,
    });
    
    return res.data;
  } catch (error) {
    console.log(error);
    const msg = error.response?.data?.details || 'Error al registrarse';
    throw new Error(msg);
  }
};

export const verificarCuenta = async (token) => {
  try {
    const res = await axios.get(`/auth/verificar/${token}`);
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.details || 'Token inválido o expirado';
    throw new Error(msg);
  }
};


export const logout = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
};

export const getStoredUser = async () => {
  try {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.log('Error al obtener usuario:', error);
    return null;
  }
};

// Obtener token desde AsyncStorage
export const getStoredToken = async () => {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    console.log('Error al obtener token:', error);
    return null;
  }
};

// Verificar si el usuario está autenticado
export const isAuthenticated = async () => {
  try {
    const token = await getStoredToken();
    return !!token;
  } catch (error) {
    return false;
  }
};
