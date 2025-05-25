import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import axios from '../services/api.js';

export default function ListaVotaciones({ navigation }) {
  const [votaciones, setVotaciones] = useState([]);

  useEffect(() => {
  axios.get('/votaciones')
    .then(res => {
      setVotaciones(res.data);
    })
    .catch(err => {
      console.error("Error al cargar votaciones", err);
    });
}, []);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24 }}>Votaciones Disponibles</Text>
      <FlatList
        data={votaciones}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('Votar', { id: item.id })}>
            <Text style={{ padding: 10, fontSize: 18 }}>{item.titulo}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
