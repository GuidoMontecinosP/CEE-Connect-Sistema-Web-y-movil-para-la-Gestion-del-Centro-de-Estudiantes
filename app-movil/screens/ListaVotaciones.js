import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import axios from '../services/api.js';

export default function ListaVotaciones({ navigation }) {
  const [votaciones, setVotaciones] = useState([]);

  useEffect(() => {
    axios.get('/votacion')
      .then(res => setVotaciones(res.data.data))
      .catch(err => console.error("Error al cargar votaciones", err));
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24 }}>Votaciones Disponibles</Text>
      <FlatList
        data={votaciones}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 18 }}>{item.titulo}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Votar', { id: item.id })}>
              <Text style={{ color: 'blue' }}> Emitir Voto</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Resultados', { id: item.id })}>
              <Text style={{ color: 'blue' }}> Ver Resultados</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Detalle', { id: item.id })}>
              <Text style={{ color: 'blue' }}> Ver Detalle</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
