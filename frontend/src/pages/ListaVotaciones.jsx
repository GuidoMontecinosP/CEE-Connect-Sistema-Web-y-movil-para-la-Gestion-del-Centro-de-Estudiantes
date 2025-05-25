import { useEffect, useState } from 'react';
import { getVotaciones } from '../services/votacion.services';
import { Link } from 'react-router-dom';

function ListaVotaciones() {
  const [votaciones, setVotaciones] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getVotaciones();
      setVotaciones(data);
    };
    fetchData();
  }, []);

  return (
    <div>
      <h1>Votaciones Disponibles</h1>
      <ul>
        {votaciones.map(v => (
          <li key={v.id}>
            <strong>{v.titulo}</strong><br />
            <Link to={`/votar/${v.id}`}>Votar</Link>
          </li>
        ))}
      </ul>
      <Link to="/crear">Crear Votación</Link>
    </div>
  );
}

export default ListaVotaciones;
