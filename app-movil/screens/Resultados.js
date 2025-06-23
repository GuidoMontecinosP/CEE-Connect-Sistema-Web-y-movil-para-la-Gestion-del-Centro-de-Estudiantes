import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import axios from '../services/api';

export default function Resultados({ route }) {
  const { id } = route.params;
  const [resultados, setResultados] = useState(null);

  useEffect(() => {
    axios.get(`/votacion/${id}/resultados`)
      .then(res => setResultados(res.data.data))
      .catch(err => alert('Error al cargar resultados'));
  }, []);

  if (!resultados) return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Cargando resultados...</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📊 Resultados de:</Text>
      <Text style={styles.subtitle}>{resultados.votacion.titulo}</Text>

      {resultados.resultados.map((r, i) => (
        <View key={i} style={styles.resultCard}>
          <Text style={styles.option}>{r.opcion}</Text>
          <Text style={styles.votes}>{r.votos} votos</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#374151',
    marginBottom: 20,
  },
  resultCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  option: {
    fontSize: 18,
    color: '#111827',
    marginBottom: 4,
    fontWeight: '600',
  },
  votes: {
    fontSize: 16,
    color: '#6b7280',
  },
});
