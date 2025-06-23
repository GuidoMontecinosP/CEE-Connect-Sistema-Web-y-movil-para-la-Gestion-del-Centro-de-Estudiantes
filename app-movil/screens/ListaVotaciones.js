import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import axios from '../services/api.js';

export default function ListaVotaciones({ navigation }) {
  const [votaciones, setVotaciones] = useState([]);
  const [estadoFiltro, setEstadoFiltro] = useState('todas');

  useEffect(() => {
    cargarVotaciones();
  }, []);

  const cargarVotaciones = () => {
    axios.get('/votacion')
      .then(res => setVotaciones(res.data.data))
      .catch(err => console.error("Error al cargar votaciones", err));
  };

  const cerrarVotacion = (id) => {
    Alert.alert(
      "Confirmar cierre",
      "¿Estás seguro de que deseas cerrar esta votación?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar",
          style: "destructive",
          onPress: () => {
            axios.patch(`/votacion/${id}/cerrar`)
              .then(() => cargarVotaciones())
              .catch(() => alert('No se pudo cerrar la votación.'));
          }
        }
      ]
    );
  };

const votacionesFiltradas = votaciones
  .filter(v => estadoFiltro === 'todas' || v.estado === estadoFiltro)
  .sort((a, b) => {
    if (a.estado === b.estado) return 0;
    return a.estado === 'activa' ? -1 : 1;
  });

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.titulo}</Text>
      <Text style={styles.description}>Estado: {item.estado}</Text>
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

        {item.estado === 'activa' && (
          <TouchableOpacity onPress={() => cerrarVotacion(item.id)}>
            <Text style={styles.dangerLink}>❌ Cerrar Votación</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🗳️ Votaciones Disponibles</Text>

      {/* Filtros */}
      <View style={styles.filterRow}>
        {['todas', 'activa', 'cerrada'].map((estado) => (
          <TouchableOpacity
            key={estado}
            style={[
              styles.filterButton,
              estadoFiltro === estado && styles.activeFilterButton
            ]}
            onPress={() => setEstadoFiltro(estado)}
          >
            <Text style={[
              styles.filterText,
              estadoFiltro === estado && styles.activeFilterText
            ]}>
              {estado === 'todas' ? 'Todas' : estado.charAt(0).toUpperCase() + estado.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={votacionesFiltradas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
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
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 20,
  },
  activeFilterButton: {
    backgroundColor: '#1e3a8a',
  },
  filterText: {
    fontSize: 14,
    color: '#374151',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  actions: {
    gap: 6,
  },
  link: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '500',
    paddingVertical: 2,
  },
  dangerLink: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '500',
    paddingVertical: 2,
  },
});
