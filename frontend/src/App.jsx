import { Routes, Route, Navigate } from 'react-router-dom';

import ListarVotaciones from './pages/ListarVotacion';
import CrearVotacion from './pages/CrearVotacion';
import Votar from './pages/Votar';
import VerVotacion from './pages/VerVotacion';
import Resultados from './pages/Resultados';
import CerrarVotacion from './pages/CerrarVotacion';
import GestionUsuarios  from './pages/GestionUsuarios';
import ListaSugerencias from './pages/ListaSugerencias';
import ResetPassword   from './pages/ResetPassword';
import Eventos from './pages/Eventos';
import VerEventos from './pages/VerEventos';
import CrearEvento from './pages/CrearEventos';
import Noticias from './pages/Noticias';
import AdminAnuncios from './pages/AdminAnuncios';
import CrearSugerencia from './pages/CrearSugerencia';
import MisSugerencias from './pages/MisSugerencias';
import Login from './pages/Login';
import DashboardAdmin from './pages/DashboardAdmin';
import EditarSugerencia from './pages/EditarSugerencia';
import Unauthorized from './pages/Unauthorized';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './context/AuthContext';
import Verificado from './pages/Verificado';
import Register from './pages/Register'; 
import PassOlvidada from './pages/PassOlvidada';
function App() {
  const { usuario } = useAuth();

  return (
    <Routes>
    
      <Route
        path="/"
        element={
          usuario ? (
            <Navigate to="/noticias" />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/verificar/:token" element={<Verificado />} />
      <Route path="/register" element={<Register />} /> 
      <Route path="/recuperar-contrasena" element={<PassOlvidada />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
       <Route path="/dashboard" element={<DashboardAdmin />} />

      {/* Rutas protegidas - ADMINISTRADOR */}
      <Route element={<PrivateRoute allowedRoles={['administrador']} />}>
        
        <Route path="/crear" element={<CrearVotacion />} />
        <Route path="/votacion/:id/cerrar" element={<CerrarVotacion />} />
        <Route path="/votacion/:id" element={<VerVotacion />} />
        <Route path="/verEventos" element={<VerEventos />} />
        <Route path="/crearEvento" element={<CrearEvento />} />
        <Route path="/adminAnuncios" element={<AdminAnuncios />} />
        
      </Route>
      {/* Rutas protegidas - ESTUDIANTE */}
      <Route element={<PrivateRoute allowedRoles={['estudiante']} />}>
        <Route path="/sugerencias/nueva" element={<CrearSugerencia />} />
        <Route path="/mis-sugerencias" element={<MisSugerencias />} />
        </Route>

      {/* Rutas protegidas - SUPERADMIN */}
      <Route element={<PrivateRoute allowedRoles={['superadmin']} />}>
        <Route path="/usuarios" element={<GestionUsuarios />} />
        </Route>
    
      {/* Ruta protegida común*/}
      <Route element={<PrivateRoute allowedRoles={['administrador', 'estudiante', 'superadmin']} />}>
        <Route path="/votaciones" element={<ListarVotaciones />} />
        <Route path="/votacion/:id/resultados" element={<Resultados />} />
        <Route path="/noticias" element={<Noticias />} />
      <Route path="/eventos" element={<Eventos />} />
      <Route path = "votacion/:id/votar" element={<Votar />} />
   <Route path="/sugerencias" element={<ListaSugerencias />} />
<Route path="/sugerencias/:id/editar" element={<EditarSugerencia />} />
        <Route path="/dashboard" element={<DashboardAdmin />} />
      </Route>
    </Routes>
  );
}

export default App;