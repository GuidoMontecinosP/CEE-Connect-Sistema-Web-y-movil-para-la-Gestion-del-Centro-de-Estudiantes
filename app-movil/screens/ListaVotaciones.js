import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import axios from '../services/api.js';

export default function ListaVotaciones({ navigation }) {
  const [votaciones, setVotaciones] = useState([]);

  useEffect(() => {
    axios.get('/votacion')
      .then(res => setVotaciones(res.data.data))
      .catch(err => console.error("Error al cargar votaciones", err));
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.titulo}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => navigation.navigate('Votar', { id: item.id })}>
          <Text style={styles.link}>🗳️ Emitir Voto</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Resultados', { id: item.id })}>
          <Text style={styles.link}>📊 Ver Resultados</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Detalle', { id: item.id })}>
          <Text style={styles.link}>🔍 Ver Detalle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🗳️ Votaciones Disponibles</Text>
      <FlatList
        data={votaciones}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3, // sombra Android
    shadowColor: '#000', // sombra iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  actions: {
    gap: 8,
  },
  link: {
    fontSize: 16,
    color: '#2563eb',
    marginVertical: 2,
  },
});
