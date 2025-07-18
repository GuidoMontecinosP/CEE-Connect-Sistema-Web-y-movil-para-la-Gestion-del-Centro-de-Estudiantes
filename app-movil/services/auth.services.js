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

export const logout = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
};
