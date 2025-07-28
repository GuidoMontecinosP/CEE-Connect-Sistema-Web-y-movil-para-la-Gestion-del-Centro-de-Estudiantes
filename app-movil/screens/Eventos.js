import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { eventosService } from '../services/eventos.service';
import { AuthContext } from '../context/Authcontext';
import { formatDateToDDMMYYYY } from '../utils/formatDate';
import { RefreshControl } from 'react-native';

const ListaEventos = () => {
  const navigation = useNavigation();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { usuario } = useContext(AuthContext);

  const esAdministrador = usuario?.rol?.nombre === 'administrador';

  const cargarEventos = async () => {
    setLoading(true);
    try {
      const data = await eventosService.obtenerEventos();
      setEventos(Array.isArray(data) ? data : []);
    } catch (err) {
      Alert.alert('Error', 'No se pudieron cargar los eventos.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    cargarEventos();
  }, []);

  // Refresca automáticamente al volver a la pantalla
  useFocusEffect(
    useCallback(() => {
      cargarEventos();
    }, [])
  );

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await cargarEventos();
    setRefreshing(false);
  };

  const handleEliminarEvento = (eventoId) => {
    Alert.alert(
      '¿Eliminar evento?',
      'Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eventosService.eliminarEvento(eventoId);
              setEventos(prev => prev.filter(e => e.id !== eventoId));
              Alert.alert('Evento eliminado');
            } catch (err) {
              console.error(err);
              Alert.alert('Error', 'No se pudo eliminar el evento.');
            }
          }
        }
      ]
    );
  };

  const renderEventoCard = (evento) => (
    <View key={evento.id} style={styles.card}>
      {evento.imagen && (
        <Image source={{ uri: `http://146.83.198.35:1217${evento.imagen}` }} style={styles.image} />
      )}

      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={2}>{evento.titulo}</Text>
      </View>

      <View style={styles.infoRow}>
        <Icon name="calendar" size={18} color="#64748b" />
        <Text style={styles.infoText}>
          {formatDateToDDMMYYYY(evento.fecha)} {evento.hora}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Icon name="map-marker" size={18} color="#64748b" />
        <Text style={styles.infoText}>{evento.lugar}</Text>
      </View>
      <View style={styles.infoRow}>
        <Icon name="tag" size={18} color="#64748b" />
        <Text style={styles.infoText}>{evento.tipo}</Text>
      </View>
      <View style={styles.infoRow}>
        <Icon name="text" size={18} color="#64748b" />
        <Text style={styles.infoText}>{evento.descripcion}</Text>
      </View>

      {esAdministrador && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.button, styles.buttonOutline]}
            onPress={() => navigation.navigate('EditarEvento', { eventoId: evento.id })}
          >
            <Icon name="pencil" size={18} color="#1e3a8a" />
            <Text style={styles.buttonTextOutline}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonDanger]}
            onPress={() => handleEliminarEvento(evento.id)}
          >
            <Icon name="delete" size={18} color="#fff" />
            <Text style={styles.buttonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Listado de Eventos</Text>
          <Text style={styles.subtitle}>
            {esAdministrador
              ? 'Gestiona y edita los eventos del sistema'
              : 'Consulta los próximos eventos disponibles'}
          </Text>
        </View>
        {esAdministrador && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CrearEvento')}
          >
            <Icon name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={styles.loadingText}>Cargando eventos...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1e3a8a"]} />
          }
        >
          {eventos.map(renderEventoCard)}
          {eventos.length === 0 && (
            <View style={styles.emptyContainer}>
              <Icon name="calendar-remove-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>No hay eventos registrados</Text>
              <Text style={styles.emptySubtitle}>¡Vuelve pronto para ver nuevos eventos!</Text>
            </View>
          )}
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 20,
    paddingVertical: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 8,
    marginLeft: 16,
  },
  scrollView: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e3a8a',
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 6,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  buttonDanger: {
    backgroundColor: '#dc2626',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1e3a8a',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
  },
  buttonTextOutline: {
    color: '#1e3a8a',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  bottomPadding: {
    height: 20,
  },
});

export default ListaEventos;
