import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import axios from '../services/api';

export default function Resultados({ route }) {
  const { id } = route.params;
  const [resultados, setResultados] = useState(null);

  useEffect(() => {
    axios.get(`/votacion/${id}/resultados`)
      .then(res => setResultados(res.data.data))
      .catch(err => alert('Error al cargar resultados'));
  }, []);

  if (!resultados) return <Text>Cargando resultados...</Text>;

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20 }}>Resultados de: {resultados.votacion.titulo}</Text>
      {resultados.resultados.map((r, i) => (
        <Text key={i}>{r.opcion}: {r.votos} votos</Text>
      ))}
    </View>
  );
}
