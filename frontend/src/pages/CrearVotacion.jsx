import { useState } from 'react';
import { votacionService } from '../services/votacion.services';

function CrearVotacion() {
  const [titulo, setTitulo] = useState('');
  const [opciones, setOpciones] = useState(['', '']); // Comienza con 2 opciones mínimas

  const handleOpcionChange = (index, value) => {
    const nuevasOpciones = [...opciones];
    nuevasOpciones[index] = value;
    setOpciones(nuevasOpciones);
  };

  const agregarOpcion = () => {
    if (opciones.length < 10) {
      setOpciones([...opciones, '']);
    }
  };

  const eliminarOpcion = (index) => {
    if (opciones.length > 2) {
      const nuevasOpciones = opciones.filter((_, i) => i !== index);
      setOpciones(nuevasOpciones);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const opcionesValidas = opciones.filter(op => op.trim() !== '');
    if (opcionesValidas.length < 2) {
      return alert('Debes ingresar al menos 2 opciones válidas');
    }

    try {
      await votacionService.crearVotacion(titulo, opcionesValidas);
      alert('Votación creada exitosamente');
      setTitulo('');
      setOpciones(['', '']);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Crear Nueva Votación</h1>

      <input
        type="text"
        placeholder="Título de la votación"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        required
      />
      <br /><br />

      <h3>Opciones:</h3>
      {opciones.map((opcion, index) => (
        <div key={index}>
          <input
            type="text"
            placeholder={`Opción ${index + 1}`}
            value={opcion}
            onChange={(e) => handleOpcionChange(index, e.target.value)}
            required
          />
          {opciones.length > 2 && (
            <button type="button" onClick={() => eliminarOpcion(index)}>X</button>
          )}
        </div>
      ))}

      {opciones.length < 10 && (
        <button type="button" onClick={agregarOpcion}>+ Agregar opción</button>
      )}
      <br /><br />

      <button type="submit">Crear Votación</button>
    </form>
  );
}

export default CrearVotacion;
