import { View, Text, Button, TextInput } from 'react-native';
import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/Authcontext.js';
import axios from '../services/api.js';

export default function EmitirVoto({ route }) {
  const { id } = route.params;
  const [votacion, setVotacion] = useState(null);
  const [opcionId, setOpcionId] = useState(null);
  const { usuario } = useContext(AuthContext);

  useEffect(() => {
    axios.get(`/votacion/${id}`).then(res => setVotacion(res.data.data));
  }, []);

  const votar = async () => {
    try {
      await axios.post(`/votacion/${id}/votar`, {
        usuarioId: usuario.id, 
        opcionId
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
      
      {/* Mostrar información del usuario */}
      <Text style={{ marginVertical: 10, fontSize: 16 }}>
        Votante: {usuario.nombre}
      </Text>

      {votacion.opciones.map(op => (
        <Button
          key={op.id}
          title={op.textoOpcion}
          onPress={() => setOpcionId(op.id)}
          color={opcionId === op.id ? 'green' : 'gray'}
        />
      ))}

      <Button title="Votar" onPress={votar} disabled={!opcionId} />
    </View>
  );
}