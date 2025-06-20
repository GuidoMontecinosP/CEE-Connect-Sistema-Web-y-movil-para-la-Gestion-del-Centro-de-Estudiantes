import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const token = Cookies.get("token");

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUsuario({ ...payload, token });
    } catch (error) {
      console.error("Token inválido:", error);
      Cookies.remove("token");
      setUsuario(null);
    }
  }

  setLoading(false); // ✅ siempre se ejecuta, con o sin token
}, []);


  const login = (userData, token) => {
    Cookies.set("token", token);
    setUsuario({ ...userData, token }); // Asegúrate que userData incluya .rol.nombre
  };

  const logout = () => {
    Cookies.remove("token");
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
