import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ListarVotaciones from './pages/ListarVotacion';
import CrearVotacion from './pages/CrearVotacion';
import Votar from './pages/Votar';
import VerVotacion from './pages/VerVotacion';
import Resultados from './pages/Resultados';
import CerrarVotacion from './pages/CerrarVotacion';
import MenuPrincipal from './pages/MenuPrincipal';

function App() {
  return (
    <Router>
      <Routes>
  <Route path="/" element={<MenuPrincipal />} />
  <Route path="/votaciones" element={<ListarVotaciones />} />
  <Route path="/crear" element={<CrearVotacion />} />
  <Route path="/votacion/:id" element={<VerVotacion />} />
  <Route path="/votacion/:id/votar" element={<Votar />} />
  <Route path="/votacion/:id/resultados" element={<Resultados />} />
  <Route path="/votacion/:id/cerrar" element={<CerrarVotacion />} />
</Routes>
    </Router>
  );
}

export default App;
