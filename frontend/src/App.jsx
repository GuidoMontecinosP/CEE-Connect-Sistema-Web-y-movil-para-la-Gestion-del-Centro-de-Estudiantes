import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ListaVotaciones from './pages/ListaVotaciones';
import CrearVotacion from './pages/CrearVotacion';
import EmitirVoto from './pages/EmitirVoto';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ListaVotaciones />} />
        <Route path="/crear" element={<CrearVotacion />} />
        <Route path="/votar/:id" element={<EmitirVoto />} />
      </Routes>
    </Router>
  );
}

export default App;
