import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ allowedRoles }) => {
  const { usuario, loading } = useAuth();

  if (loading) return null;

  if (!usuario) return <Navigate to="/login" />;

  const rolNombre = typeof usuario.rol === "string" ? usuario.rol : usuario.rol?.nombre;
 //console.log("🧠 Usuario cargado:", usuario);
//console.log("🧠 Rol evaluado:", typeof usuario.rol === "string" ? usuario.rol : usuario.rol?.nombre);

  return allowedRoles.includes(rolNombre)
    ? <Outlet />
    : <Navigate to="/unauthorized" />;
};


export default PrivateRoute;
