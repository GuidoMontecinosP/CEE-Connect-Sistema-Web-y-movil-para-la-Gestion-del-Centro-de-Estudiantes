import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { votacionService } from '../services/votacion.services';

function Resultados() {
  const { id } = useParams();
  const [resultados, setResultados] = useState(null);

  useEffect(() => {
    votacionService.obtenerResultados(id)
      .then(res => setResultados(res.data))
      .catch(err => alert(err.message));
  }, [id]);

  if (!resultados) return <p>Cargando resultados...</p>;

  return (
    <div>
      <h1>Resultados de: {resultados.votacion.titulo}</h1>
      <ul>
        {resultados.resultados.map((r, i) => (
          <li key={i}>{r.opcion} - {r.votos} votos</li>
        ))}
      </ul>
    </div>
  );
}

export default Resultados;