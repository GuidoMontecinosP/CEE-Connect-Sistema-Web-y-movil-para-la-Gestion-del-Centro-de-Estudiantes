import { useEffect, useState } from 'react';
import { votacionService } from '../services/votacion.services';
import { Link } from 'react-router-dom';

function ListarVotaciones() {
  const [votaciones, setVotaciones] = useState([]);

  useEffect(() => {
    votacionService.obtenerVotaciones()
      .then(res => setVotaciones(res.data))
      .catch(err => alert(err.message));
  }, []);

  return (
    <div>
      <h1>Listado de Votaciones</h1>
      {votaciones.length === 0 ? (
        <p>No hay votaciones registradas.</p>
      ) : (
        <ul>
          {votaciones.map(v => (
            <li key={v.id}>
              <strong>{v.titulo}</strong> - Estado: {v.estado} <br />
              <Link to={`/votacion/${v.id}`}> Ver Detalle</Link> |{' '}
              <Link to={`/votacion/${v.id}/votar`}> Votar</Link> |{' '}
              <Link to={`/votacion/${v.id}/resultados`}> Resultados</Link> |{' '}
              {v.estado === 'activa' && (
                <Link to={`/votacion/${v.id}/cerrar`}> Cerrar</Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ListarVotaciones;