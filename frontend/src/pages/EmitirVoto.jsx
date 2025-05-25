import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getVotacionPorId } from '../services/votacion.services';
import { emitirVoto } from '../services/votacionrespuesta.services';

function EmitirVoto() {
  const { id } = useParams();
  const [votacion, setVotacion] = useState(null);
  const [opcionId, setOpcionId] = useState(null);
  const [usuarioId, setUsuarioId] = useState('');

  //const [usuarioId] = useState(2); 

  useEffect(() => {
    const fetch = async () => {
      const data = await getVotacionPorId(id);
      setVotacion(data);
    };
    fetch();
  }, [id]);

  const handleVotar = async () => {
    try {
      await emitirVoto({ usuarioId, votacionId: id, opcionId });
      alert("¡Voto registrado!");
    } catch (err) {
      alert("Error al votar: " + err.response?.data?.error);
    }
  };

  if (!votacion) return <p>Cargando votación...</p>;

  return (
    <div>
        <input
  type="number"
  placeholder="ID del usuario"
  value={usuarioId}
  onChange={(e) => setUsuarioId(Number(e.target.value))}
/>
      <h2>{votacion.titulo}</h2>
      <p>{votacion.descripcion}</p>
      <ul>
        {votacion.opciones.map(op => (
          <li key={op.id}>
            <label>
              <input type="radio" name="opcion" value={op.id} onChange={() => setOpcionId(op.id)} />
              {op.textoOpcion}
            </label>
          </li>
        ))}
      </ul>
      <button onClick={handleVotar} disabled={!opcionId}>Votar</button>
    </div>
  );
}

export default EmitirVoto;
