import { Link } from 'react-router-dom';

function MenuPrincipal() {
  return (
    <div>
      <h1>Menú Principal</h1>
      <ul>
        <li><Link to="/votaciones"> Listado de Votaciones</Link></li>
        <li><Link to="/crear">Crear Nueva Votación</Link></li>
        <li><Link to="/eventos">Proximo Eventos</Link></li>
      </ul>
    </div>
  );
}

export default MenuPrincipal;