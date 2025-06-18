// src/components/PrivateRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ allowedRoles }) => {
  const { usuario, loading } = useAuth();

  if (loading) return null; 

  if (!usuario) return <Navigate to="/login" />;

  return allowedRoles.includes(usuario.rol) ? <Outlet /> : <Navigate to="/unauthorized" />;
};

export default PrivateRoute;
