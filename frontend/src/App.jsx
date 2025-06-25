import { Routes, Route, Navigate } from 'react-router-dom';

import ListarVotaciones from './pages/ListarVotacion';
import CrearVotacion from './pages/CrearVotacion';
import Votar from './pages/Votar';
import VerVotacion from './pages/VerVotacion';
import Resultados from './pages/Resultados';
import CerrarVotacion from './pages/CerrarVotacion';
import MenuPrincipal from './pages/MenuPrincipal';
import ResultadosPublicados from './pages/ResultadosPublicados';

import VerEventos from './pages/VerEventos';
import Noticias from './pages/Noticias';

import Login from './pages/Login';
import DashboardAdmin from './pages/DashboardAdmin';

import Unauthorized from './pages/Unauthorized';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './context/AuthContext';

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
      

      {/* Rutas protegidas - ADMINISTRADOR */}
      <Route element={<PrivateRoute allowedRoles={['administrador']} />}>
        
        <Route path="/crear" element={<CrearVotacion />} />
        <Route path="/votacion/:id/cerrar" element={<CerrarVotacion />} />
        <Route path="/votacion/:id" element={<VerVotacion />} />
        
      </Route>

    
      {/* Ruta protegida común, si decides mantener el MenuPrincipal */}
      <Route element={<PrivateRoute allowedRoles={['administrador', 'estudiante']} />}>
        <Route path="/menu" element={<MenuPrincipal />} />
        <Route path="/votaciones" element={<ListarVotaciones />} />
        <Route path="/votacion/:id/resultados" element={<Resultados />} />
        <Route path="/noticias" element={<Noticias />} />
      <Route path="/eventos" element={<VerEventos />} />
      <Route path="/dashboard" element={<DashboardAdmin />} />
      <Route path = "votacion/:id/votar" element={<Votar />} />
      <Route path="/resultados-publicados" element={<ResultadosPublicados />} />

      </Route>
    </Routes>
  );
}

export default App;
