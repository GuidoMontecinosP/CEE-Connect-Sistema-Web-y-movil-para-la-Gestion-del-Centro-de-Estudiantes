import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import axios from '../services/api.js';
import { formatDateToDDMMYYYY } from '../utils/formatDate.js';
import { StyleSheet } from 'react-native';
// Agregar iconos de react-native-vector-icons
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ListaEventos({ navigation }) {
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    axios.get('/eventos/eventos')
      .then(res => setEventos(res.data))
      .catch(err => console.error("Error al cargar los Eventos", err));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}> <Icon name="calendar-month" size={28} color="#1e3a8a" /> Próximos Eventos</Text>
      <FlatList
        data={eventos}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="calendar-remove-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No hay eventos registrados</Text>
            <Text style={styles.emptySubtitle}>¡Vuelve pronto para ver nuevos eventos!</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>{item.titulo}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="text" size={18} color="#64748b" style={styles.infoIcon} />
              <Text style={styles.infoText}>{item.descripcion}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="calendar" size={18} color="#64748b" style={styles.infoIcon} />
              <Text style={styles.infoText}>{formatDateToDDMMYYYY(item.fecha)} {item.hora}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="map-marker" size={18} color="#64748b" style={styles.infoIcon} />
              <Text style={styles.infoText}>{item.lugar}</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="tag" size={18} color="#64748b" style={styles.infoIcon} />
              <Text style={styles.infoText}>{item.tipo}</Text>
            </View>
          </View>
        )}
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#1e3a8a',
  },
  filterText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#e9e9e9',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#052569',
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    marginLeft: 2,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 17,
    color: '#22223b',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  activeBadge: {
    backgroundColor: '#dcfce7',
  },
  closedBadge: {
    backgroundColor: '#fef2f2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: '#166534',
  },
  closedText: {
    color: '#991b1b',
  },
  actions: {
    gap: 8,
  },
  actionButton: {
    paddingVertical: 2,
  },
  primaryAction: {
    fontSize: 16,
    color: '#1e3a8a',
    fontWeight: '600',
  },
  secondaryAction: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '500',
  },
  dangerAction: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});