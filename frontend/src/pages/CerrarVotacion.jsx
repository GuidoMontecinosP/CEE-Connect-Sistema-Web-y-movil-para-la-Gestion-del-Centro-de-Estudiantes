import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { votacionService } from '../services/votacion.services';

function CerrarVotacion() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const cerrar = async () => {
      try {
        await votacionService.cerrarVotacion(id);
        alert('Votación cerrada correctamente');
        navigate('/');
      } catch (error) {
        alert(error.message);
        navigate('/');
      }
    };

    cerrar();
  }, [id, navigate]);

  return <p>Cerrando votación...</p>;
}

export default CerrarVotacion;
