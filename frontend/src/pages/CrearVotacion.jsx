import { useState } from 'react';
import { crearVotacion } from '../services/votacion.services';

function CrearVotacion() {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [creadaPorId, setCreador] = useState(1); // por ahora fijo
  const [inicio, setInicio] = useState('');
  const [fin, setFin] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await crearVotacion({
        titulo,
        descripcion,
        fechaInicio: inicio,
        fechaFin: fin,
        creadaPorId
      });
      alert('Votación creada');
    } catch (err) {
      alert('Error al crear votación');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Crear Nueva Votación</h1>
      <input placeholder="Título" value={titulo} onChange={e => setTitulo(e.target.value)} /><br />
      <textarea placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} /><br />
      <input type="datetime-local" value={inicio} onChange={e => setInicio(e.target.value)} /><br />
      <input type="datetime-local" value={fin} onChange={e => setFin(e.target.value)} /><br />
      <button type="submit">Crear</button>
    </form>
  );
}

export default CrearVotacion;
