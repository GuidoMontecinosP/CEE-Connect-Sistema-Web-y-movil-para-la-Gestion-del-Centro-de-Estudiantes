import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { muteoService } from '../services/muteado.services';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUserMuted, setIsUserMuted] = useState(false);
  const [muteLoading, setMuteLoading] = useState(false);
  const [muteoInfo, setMuteoInfo] = useState(null);

  useEffect(() => {
    const token = Cookies.get("token");

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUsuario({ ...payload, token });
        
        // Verificar estado de muteo después de establecer el usuario
        checkMuteStatus(payload.id || payload.usuario_id || payload.userId);
      } catch (error) {
        console.error("Token inválido:", error);
        Cookies.remove("token");
        setUsuario(null);
      }
    }

    setLoading(false);
  }, []);

  // Función para verificar el estado de muteo
  const checkMuteStatus = async (usuarioId) => {
    if (!usuarioId) return;
    
    setMuteLoading(true);
    try {
      const response = await muteoService.obtenerEstadoMuteo(usuarioId);
      console.log("Estado de muteo en AuthContext:", response);
      
      if (response.data && response.data.isMuted !== undefined) {
        setIsUserMuted(response.data.isMuted);
        setMuteoInfo(response.data.muteo);
      } else {
        // Si no hay estructura data, usar directamente la respuesta
        setIsUserMuted(response.isMuted || false);
        setMuteoInfo(response.muteo || null);
      }
      
      // Si el muteo expiró automáticamente, actualizar el estado
      if (response.message === "Muteo expirado") {
        setIsUserMuted(false);
        setMuteoInfo(null);
      }
    } catch (error) {
      console.error("Error verificando estado de muteo:", error);
      setIsUserMuted(false);
      setMuteoInfo(null);
    } finally {
      setMuteLoading(false);
    }
  };

  const login = (userData, token) => {
    Cookies.set("token", token);
    setUsuario({ ...userData, token });
    
    // Verificar muteo al hacer login
    checkMuteStatus(userData.id || userData.usuario_id || userData.userId);
  };

  const logout = () => {
    Cookies.remove("token");
    setUsuario(null);
    setIsUserMuted(false);
    setMuteoInfo(null);
  };

  // Función para refrescar el estado de muteo manualmente
  const refreshMuteStatus = () => {
    if (usuario?.id || usuario?.usuario_id || usuario?.userId) {
      checkMuteStatus(usuario.id || usuario.usuario_id || usuario.userId);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      usuario, 
      login, 
      logout, 
      loading,
      isUserMuted,
      muteLoading,
      muteoInfo,
      canCreateOrEdit: usuario && !isUserMuted,
      refreshMuteStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);