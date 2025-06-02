import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { votacionService } from '../services/votacion.services';

function VerVotacion() {
  const { id } = useParams();
  const [votacion, setVotacion] = useState(null);

  useEffect(() => {
    votacionService.obtenerVotacionPorId(id)
      .then(res => setVotacion(res.data))
      .catch(err => alert(err.message));
  }, [id]);

  if (!votacion) return <p>Cargando...</p>;

  return (
    <div>
      <h1>{votacion.titulo}</h1>
      <ul>
        {votacion.opciones.map(op => (
          <li key={op.id}>{op.textoOpcion}</li>
        ))}
      </ul>
    </div>
  );
}

export default VerVotacion;
