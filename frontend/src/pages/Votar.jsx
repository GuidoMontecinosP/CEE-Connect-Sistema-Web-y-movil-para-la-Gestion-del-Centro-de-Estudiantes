import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { votacionService } from '../services/votacion.services';
import { votoService } from '../services/voto.services';

function Votar() {
  const { id } = useParams();
  const [votacion, setVotacion] = useState(null);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);
  const [yaVoto, setYaVoto] = useState(false);
  const usuarioId = 1; // Fijo por ahora

  useEffect(() => {
    votacionService.obtenerVotacionPorId(id).then(res => setVotacion(res.data));
    votoService.verificarSiYaVoto(usuarioId, id).then(res => setYaVoto(res.data.yaVoto));
  }, [id]);

  const handleSubmit = async () => {
    try {
      await votoService.emitirVoto(usuarioId, id, opcionSeleccionada);
      alert('¡Voto emitido!');
      setYaVoto(true);
    } catch (error) {
      alert(error.message);
    }
  };

  if (!votacion) return <p>Cargando votación...</p>;

  return (
    <div>
      <h1>Votar en: {votacion.titulo}</h1>
      {yaVoto ? (
        <p>Ya has votado en esta votación.</p>
      ) : (
        <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
          {votacion.opciones.map(op => (
            <div key={op.id}>
              <input type="radio" name="opcion" value={op.id}
                onChange={() => setOpcionSeleccionada(op.id)} />
              {op.textoOpcion}
            </div>
          ))}
          <button type="submit">Emitir Voto</button>
        </form>
      )}
    </div>
  );
}

export default Votar;