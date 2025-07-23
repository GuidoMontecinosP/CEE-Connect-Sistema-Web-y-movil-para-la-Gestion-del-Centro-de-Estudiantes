import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { sugerenciasService } from '../services/sugerencia.services.js';

const { width } = Dimensions.get('window');

export default function MisSugerencias() {
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [mensajeActivo, setMensajeActivo] = useState(null);
  const [eliminandoId, setEliminandoId] = useState(null);
  const navigation = useNavigation();

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const fueEditada = (createdAt, updatedAt) => {
    if (!createdAt || !updatedAt) return false;
    const created = new Date(createdAt).getTime();
    const updated = new Date(updatedAt).getTime();
    return updated > created;
  };

  const cargarMisSugerencias = async () => {
    try {
      const res = await sugerenciasService.obtenerMisSugerencias();
      setSugerencias(res.data.data || []);
    } catch (error) {
      console.error("Error al obtener mis sugerencias:", error);
      Alert.alert('Error', 'No se pudieron cargar las sugerencias');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarMisSugerencias();
    setRefreshing(false);
  };

  const eliminarSugerencia = (id, titulo) => {
    Alert.alert(
      '¿Eliminar sugerencia?',
      `¿Estás seguro de que quieres eliminar "${titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setEliminandoId(id);
              await sugerenciasService.eliminarSugerencia(id);
              
              setSugerencias(prevSugerencias => 
                prevSugerencias.filter(s => s.id !== id)
              );
              
              Alert.alert('Éxito', `Sugerencia "${titulo}" eliminada exitosamente`);
            } catch (error) {
              console.error("Error al eliminar sugerencia:", error);
              Alert.alert('Error', error.message || 'Error al eliminar la sugerencia');
            } finally {
              setEliminandoId(null);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    cargarMisSugerencias();
  }, []);

  const filtered = sugerencias.filter(s => {
    const texto = `${s.titulo} ${s.categoria} ${s.estado}`.toLowerCase();
    return texto.includes(searchText.toLowerCase());
  });

  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: '#FF8C00',
      'en proceso': '#1890FF',
      resuelta: '#52C41A',
      archivada: '#8C8C8C'
    };
    return colores[estado] || '#8C8C8C';
  };

  const renderSugerencia = ({ item }) => {
    const editada = fueEditada(item.createdAt, item.updatedAt);
    const fechaMostrar = editada ? item.updatedAt : item.createdAt;
    
    return (
      <View style={styles.sugerenciaCard}>
        {/* Header con título y estado */}
        <View style={styles.cardHeader}>
          <View style={styles.tituloContainer}>
            <Text style={styles.titulo} numberOfLines={2}>
              {item.titulo}
            </Text>
            {editada && (
              <Icon name="edit" size={14} color="#1890FF" style={styles.editIcon} />
            )}
          </View>
          <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(item.estado) }]}>
            <Text style={styles.estadoText}>{item.estado.toUpperCase()}</Text>
          </View>
        </View>

        {/* Categoría */}
        <Text style={styles.categoria}>{item.categoria}</Text>

        {/* Fecha */}
        <View style={styles.fechaContainer}>
          <Icon name="schedule" size={16} color="#8C8C8C" />
          <Text style={styles.fechaText}>
            {editada ? 'Editada: ' : 'Creada: '}{formatearFecha(fechaMostrar)}
          </Text>
        </View>

        {editada && (
          <Text style={styles.fechaOriginal}>
            Creada: {formatearFecha(item.createdAt)}
          </Text>
        )}

        {/* Botones de acción */}
        <View style={styles.accionesContainer}>
          <TouchableOpacity
            style={styles.botonAccion}
            onPress={() => {
              setMensajeActivo(item.mensaje);
              setModalVisible(true);
            }}
          >
            <Icon name="message" size={18} color="#1890FF" />
            <Text style={[styles.botonTexto, { color: '#1890FF' }]}>Ver mensaje</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonAccion}
            onPress={() => navigation.navigate('EditarSugerencia', {
                id: item.id,
              sugerencia: item
            })}
          >
            <Icon name="edit" size={18} color="#52C41A" />
            <Text style={[styles.botonTexto, { color: '#52C41A' }]}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botonAccion, eliminandoId === item.id && styles.botonDeshabilitado]}
            onPress={() => eliminarSugerencia(item.id, item.titulo)}
            disabled={eliminandoId === item.id}
          >
            {eliminandoId === item.id ? (
              <ActivityIndicator size="small" color="#FF4D4F" />
            ) : (
              <Icon name="delete" size={18} color="#FF4D4F" />
            )}
            <Text style={[styles.botonTexto, { color: '#FF4D4F' }]}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E3A8A" />
          <Text style={styles.loadingText}>Cargando sugerencias...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Sugerencias</Text>
      </View>

      {/* Buscador */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#8C8C8C" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar sugerencias..."
          placeholderTextColor="#8C8C8C"
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText !== '' && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Icon name="clear" size={20} color="#8C8C8C" />
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de sugerencias */}
      <FlatList
        data={filtered}
        renderItem={renderSugerencia}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1E3A8A']}
            tintColor="#1E3A8A"
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="lightbulb-outline" size={64} color="#D9D9D9" />
            <Text style={styles.emptyTitle}>No hay sugerencias</Text>
            <Text style={styles.emptyText}>
              {searchText 
                ? 'No se encontraron sugerencias con esos criterios'
                : 'Aún no has creado ninguna sugerencia'
              }
            </Text>
          </View>
        )}
      />

      {/* Modal para mostrar mensaje */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mensaje de la sugerencia</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#8C8C8C" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalContent}>{mensajeActivo}</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#262626',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sugerenciaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tituloContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginRight: 12,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#262626',
    flex: 1,
  },
  editIcon: {
    marginLeft: 6,
    marginTop: 2,
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  estadoText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  categoria: {
    fontSize: 14,
    color: '#1890FF',
    fontWeight: '500',
    marginBottom: 8,
  },
  fechaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  fechaText: {
    fontSize: 12,
    color: '#8C8C8C',
    marginLeft: 6,
  },
  fechaOriginal: {
    fontSize: 10,
    color: '#BFBFBF',
    marginLeft: 22,
    marginBottom: 8,
  },
  accionesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  botonAccion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  botonTexto: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8C8C8C',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8C8C8C',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#BFBFBF',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    maxHeight: '70%',
    width: width - 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#262626',
  },
  modalContent: {
    fontSize: 16,
    color: '#595959',
    lineHeight: 24,
  },
});