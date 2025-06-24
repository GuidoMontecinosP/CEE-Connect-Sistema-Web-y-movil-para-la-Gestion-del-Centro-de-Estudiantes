import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import axios from '../services/api.js';

export default function ListaVotaciones({ navigation }) {
  const [votaciones, setVotaciones] = useState([]);
  const [estadoFiltro, setEstadoFiltro] = useState('todas');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Carga inicial
  useEffect(() => {
    cargarVotaciones();
  }, []);

  // Refrescar cuando la pantalla recibe foco
  useFocusEffect(
    useCallback(() => {
      // Solo refrescar si no es la primera carga
      if (!loading) {
        cargarVotaciones();
      }
    }, [loading])
  );

  const cargarVotaciones = async () => {
    try {
      const res = await axios.get('/votacion');
      setVotaciones(res.data.data);
    } catch (err) {
      console.error("Error al cargar votaciones", err);
      Alert.alert('Error', 'No se pudieron cargar las votaciones');
    } finally {
      setLoading(false);
    }
  };

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await cargarVotaciones();
    } catch (error) {
      console.error('Error al refrescar:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const cerrarVotacion = useCallback((id) => {
    Alert.alert(
      "Confirmar cierre",
      "¿Estás seguro de que deseas cerrar esta votación?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.patch(`/votacion/${id}/cerrar`);
              await cargarVotaciones();
              Alert.alert('Éxito', 'Votación cerrada correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar la votación');
            }
          }
        }
      ]
    );
  }, []);

  const votacionesFiltradas = votaciones
    .filter(v => estadoFiltro === 'todas' || v.estado === estadoFiltro)
    .sort((a, b) => {
      if (a.estado === b.estado) return 0;
      return a.estado === 'activa' ? -1 : 1;
    });

  const renderItem = useCallback(({ item }) => (
    <VotacionItem 
      item={item} 
      navigation={navigation} 
      onCerrarVotacion={cerrarVotacion} 
    />
  ), [navigation, cerrarVotacion]);

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  const getEstadoCount = (estado) => {
    if (estado === 'todas') return votaciones.length;
    return votaciones.filter(v => v.estado === estado).length;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🗳️ Votaciones Disponibles</Text>

      {/* Filtros con contadores */}
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
              {' '}({getEstadoCount(estado)})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={votacionesFiltradas}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
        getItemLayout={(data, index) => (
          { length: 120, offset: 120 * index, index }
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1e3a8a']} // Android
            tintColor={'#1e3a8a'}  // iOS
            title="Actualizando votaciones..."
            titleColor={'#1e3a8a'}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📭</Text>
            <Text style={styles.emptyTitle}>No hay votaciones</Text>
            <Text style={styles.emptySubtitle}>
              {estadoFiltro === 'todas' 
                ? 'Aún no se han creado votaciones' 
                : `No hay votaciones ${estadoFiltro}s`}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

// Componente separado y optimizado para cada item
const VotacionItem = React.memo(({ item, navigation, onCerrarVotacion }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.title}>{item.titulo}</Text>
      <View style={[
        styles.statusBadge,
        item.estado === 'activa' ? styles.activeBadge : styles.closedBadge
      ]}>
        <Text style={[
          styles.statusText,
          item.estado === 'activa' ? styles.activeText : styles.closedText
        ]}>
          {item.estado === 'activa' ? '🟢 Activa' : '🔴 Cerrada'}
        </Text>
      </View>
    </View>
    
    <View style={styles.actions}>
      {item.estado === 'activa' && (
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Votar', { id: item.id })}
        >
          <Text style={styles.primaryAction}>🗳️ Emitir Voto</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => navigation.navigate('Resultados', { id: item.id })}
      >
        <Text style={styles.secondaryAction}>📊 Ver Resultados</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => navigation.navigate('Detalle', { id: item.id })}
      >
        <Text style={styles.secondaryAction}>🔍 Ver Detalle</Text>
      </TouchableOpacity>

      {item.estado === 'activa' && (
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onCerrarVotacion(item.id)}
        >
          <Text style={styles.dangerAction}>❌ Cerrar Votación</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
));

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
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 12,
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