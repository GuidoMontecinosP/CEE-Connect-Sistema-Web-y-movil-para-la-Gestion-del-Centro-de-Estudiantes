import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { votacionService } from '../services/votacion.services';

const DetalleVotacion = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { votacionId } = route.params;
  
  const [votacion, setVotacion] = useState(null);
  const [participantes, setParticipantes] = useState([]);
  const [totalVotos, setTotalVotos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [globalSearchText, setGlobalSearchText] = useState('');

  useEffect(() => {
    if (votacionId) cargarDatos();
  }, [votacionId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      const votacionRes = await votacionService.obtenerVotacionPorId(votacionId);
      setVotacion(votacionRes.data);

      const participantesRes = await votacionService.obtenerParticipantes(votacionId);
      let participantesData = null;

      if (participantesRes?.data) {
        participantesData = participantesRes.data;
      } else if (participantesRes?.success) {
        participantesData = participantesRes;
      }

      if (participantesData && participantesData.success) {
        setParticipantes(participantesData.participantes || []);
        setTotalVotos(participantesData.totalVotos || 0);
      } else {
        setParticipantes([]);
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudieron cargar los datos de la votación');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarDatos();
    setRefreshing(false);
  };

  const getEstadoConfig = (estado) => {
    const estadoConfig = {
      'activa': { color: '#10b981', text: 'Activa', icon: 'check-circle' },
      'cerrada': { color: '#6b7280', text: 'Cerrada', icon: 'cancel' }
    };
    return estadoConfig[estado] || { color: '#6b7280', text: estado, icon: 'help' };
  };

  const getFilteredData = () => {
    if (!globalSearchText) return participantes;
    
    return participantes.filter((record) => {
      const searchIn = [
        record.usuario?.id?.toString(),
        record.usuario?.nombre,
        record.usuario?.correo,
        record.fechaVoto ? new Date(record.fechaVoto).toLocaleString('es-ES') : ''
      ].join(' ').toLowerCase();
      
      return searchIn.includes(globalSearchText.toLowerCase());
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('es-ES');
  };

  const renderParticipante = ({ item, index }) => (
    <View style={styles.participanteCard}>
      <View style={styles.participanteHeader}>
        <View style={styles.participanteInfo}>
          <View style={styles.participanteRow}>
            <Icon name="person" size={16} color="#1e3a8a" />
            <Text style={styles.participanteNombre}>
              {item.usuario?.nombre || 'Sin nombre'}
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.participanteCorreo}>
        {item.usuario?.correo || 'Sin correo'}
      </Text>
      <View style={styles.participanteFecha}>
        <Icon name="event" size={14} color="#1e3a8a" />
        <Text style={styles.participanteFechaText}>
          {formatDate(item.fechaVoto)}
        </Text>
      </View>
    </View>
  );

  const renderOpcion = ({ item, index }) => (
    <View style={styles.opcionCard}>
      <View style={styles.opcionContent}>
        <Text style={styles.opcionTexto}>
          {index + 1}. {item.textoOpcion}
        </Text>
        {item.votos !== undefined && (
          <View style={styles.votosTag}>
            <Text style={styles.votosText}>{item.votos} votos</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={styles.loadingText}>Cargando votación...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!votacion) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>No se encontró la votación</Text>
        </View>
      </SafeAreaView>
    );
  }

  const estadoConfig = getEstadoConfig(votacion.estado);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Votación</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Título y Estado */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{votacion.titulo}</Text>
          <View style={[styles.estadoTag, { backgroundColor: estadoConfig.color }]}>
            <Icon name={estadoConfig.icon} size={14} color="#ffffff" />
            <Text style={styles.estadoText}>{estadoConfig.text}</Text>
          </View>
        </View>

        {/* Cards principales */}
        <View style={styles.cardsContainer}>
          {/* Opciones de Votación */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="visibility" size={20} color="#1e3a8a" />
              <Text style={styles.cardTitle}>Opciones de Votación</Text>
            </View>
            {votacion.opciones?.length > 0 ? (
              <FlatList
                data={votacion.opciones}
                renderItem={renderOpcion}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            ) : (
              <Text style={styles.noDataText}>No hay opciones disponibles</Text>
            )}
          </View>

          {/* Estadísticas */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="people" size={20} color="#1e3a8a" />
              <Text style={styles.cardTitle}>Estadísticas</Text>
            </View>
            <View style={styles.statsCard}>
              <Text style={styles.statsNumber}>{totalVotos}</Text>
              <Text style={styles.statsLabel}>Votos Totales</Text>
            </View>
          </View>
        </View>

        {/* Participantes */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="people" size={20} color="#1e3a8a" />
            <Text style={styles.cardTitle}>
              Participantes ({getFilteredData().length})
            </Text>
          </View>
          
          {/* Buscador */}
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#1e3a8a" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar en participantes..."
              value={globalSearchText}
              onChangeText={setGlobalSearchText}
              placeholderTextColor="#9ca3af"
            />
            {globalSearchText ? (
              <TouchableOpacity onPress={() => setGlobalSearchText('')}>
                <Icon name="clear" size={20} color="#6b7280" />
              </TouchableOpacity>
            ) : null}
          </View>

          {participantes.length === 0 ? (
            <View style={styles.noParticipantesContainer}>
              <Text style={styles.noDataText}>
                Aún no hay participantes en esta votación
              </Text>
            </View>
          ) : (
            <FlatList
              data={getFilteredData()}
              renderItem={renderParticipante}
              keyExtractor={(item, index) => item.usuario?.id?.toString() || index.toString()}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
  },
  titleSection: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 12,
  },
  estadoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  estadoText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  cardsContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e3a8a',
    marginLeft: 8,
  },
  opcionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  opcionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  opcionTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  votosTag: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  votosText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  statsNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  statsLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  participanteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  participanteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  participanteInfo: {
    flex: 1,
  },
  participanteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  participanteNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  participanteId: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 24,
  },
  participanteCorreo: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  participanteFecha: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participanteFechaText: {
    fontSize: 14,
    color: '#1f2937',
    marginLeft: 6,
  },
  separator: {
    height: 12,
  },
  noDataText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  noParticipantesContainer: {
    paddingVertical: 32,
  },
});

export default DetalleVotacion;