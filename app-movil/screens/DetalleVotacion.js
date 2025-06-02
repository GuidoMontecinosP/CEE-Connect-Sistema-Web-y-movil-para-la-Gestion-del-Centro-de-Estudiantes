import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import axios from '../services/api';

export default function DetalleVotacion({ route }) {
  const { id } = route.params;
  const [votacion, setVotacion] = useState(null);

  useEffect(() => {
    axios.get(`/votacion/${id}`)
      .then(res => setVotacion(res.data.data))
      .catch(err => alert('Error al cargar detalle'));
  }, []);

  if (!votacion) return <Text>Cargando detalle...</Text>;

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22 }}>{votacion.titulo}</Text>
      <Text style={{ marginVertical: 10 }}>Estado: {votacion.estado}</Text>
      <Text style={{ marginBottom: 10 }}>Opciones:</Text>
      {votacion.opciones.map(op => (
        <Text key={op.id}>- {op.textoOpcion}</Text>
      ))}
    </View>
  );
}
