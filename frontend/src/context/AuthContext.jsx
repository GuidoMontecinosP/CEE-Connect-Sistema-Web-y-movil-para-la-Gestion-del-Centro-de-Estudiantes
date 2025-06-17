// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUsuario({ ...payload, token });
    }
  }, []);

  const login = (userData, token) => {
    Cookies.set("token", token);
    setUsuario({ ...userData, token });
  };

  const logout = () => {
    Cookies.remove("token");
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
