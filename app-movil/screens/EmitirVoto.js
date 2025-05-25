import { View, Text, Button, TextInput } from 'react-native';
import { useEffect, useState } from 'react';
import axios from '../services/api.js';

export default function EmitirVoto({ route }) {
  const { id } = route.params;
  const [votacion, setVotacion] = useState(null);
  const [opcionId, setOpcionId] = useState(null);
  const [usuarioId, setUsuarioId] = useState('');

  useEffect(() => {
    axios.get(`/votaciones/${id}`).then(res => setVotacion(res.data));
  }, []);

  const votar = async () => {
    try {
      await axios.post('/votar', {
        usuarioId: Number(usuarioId),
        votacionId: id,
        opcionId,
      });
      alert('Voto registrado');
    } catch (err) {
      alert('Error al votar');
    }
  };

  if (!votacion) return <Text>Cargando...</Text>;

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20 }}>{votacion.titulo}</Text>
      <Text>{votacion.descripcion}</Text>

      <TextInput
        placeholder="ID de usuario"
        keyboardType="numeric"
        value={usuarioId}
        onChangeText={setUsuarioId}
        style={{ marginVertical: 10, borderBottomWidth: 1 }}
      />

      {votacion.opciones.map(op => (
        <Button
          key={op.id}
          title={op.textoOpcion}
          onPress={() => setOpcionId(op.id)}
          color={opcionId === op.id ? 'green' : 'gray'}
        />
      ))}

      <Button title="Votar" onPress={votar} disabled={!opcionId || !usuarioId} />
    </View>
  );
}
