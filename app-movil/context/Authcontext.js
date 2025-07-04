import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAuthData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;

      setUserToken(token);
      setUsuario(user);
    } catch (error) {
      console.error('Error cargando datos de autenticación:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAuthData();
  }, []);

  const login = async (token, user) => {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    setUserToken(token);
    setUsuario(user);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setUserToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ userToken, usuario, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
