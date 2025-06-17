import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import axios from '../services/api.js';
import { formatDateToDDMMYYYY } from '../utils/formatDate.js';

export default function ListaEventos({ navigation }) {
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    axios.get('/eventos/eventos')
      .then(res => setEventos(res.data))
      .catch(err => console.error("Error al cargar los Eventos", err));
  }, []);
  
  return (
    <View style={{ flex: 1, padding: 20, alignItems: 'center', justifyContent: 'flex-start' }}>
      <Text style={{ fontSize: 30, textAlign: 'center', fontWeight: 'bold', marginBottom: 20 }}>Próximos Eventos</Text>
      <FlatList
        style={{ alignSelf: 'stretch' }}
        contentContainerStyle={{ alignItems: 'center' }}
        data={eventos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 20, width: '90%' }}>
            <Text style={{ fontSize: 25, textAlign: 'center' }}>{item.titulo}</Text>
            <Text style={{ fontSize: 20, textAlign: 'center' }}>{item.descripcion}</Text>
            <Text style={{ fontSize: 20, textAlign: 'center' }}>{formatDateToDDMMYYYY(item.fecha)} {item.hora}</Text>
            <Text style={{ fontSize: 20, textAlign: 'center' }}>{item.lugar}</Text>
            <Text style={{ fontSize: 20, textAlign: 'center' }}>{item.tipo}</Text>
          </View>
        )}
      />
    </View>
  );
}