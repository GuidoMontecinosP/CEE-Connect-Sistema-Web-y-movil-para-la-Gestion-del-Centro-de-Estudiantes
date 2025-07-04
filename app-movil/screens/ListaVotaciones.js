import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import { votacionService } from '../services/votacion.services.js';
import { votoService } from '../services/voto.services.js';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/Authcontext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const ListaVotaciones = () => {
  const [votaciones, setVotaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('activa');
  const [cerrandoVotacion, setCerrandoVotacion] = useState(null);
  const [publicandoResultados, setPublicandoResultados] = useState(null);
  const [votosUsuario, setVotosUsuario] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { usuario } = useContext(AuthContext);

  // Verificar roles del usuario
  const esAdministrador = usuario?.rol?.nombre === 'administrador';
  const esEstudiante = usuario?.rol?.nombre === 'estudiante';
  const usuarioId = usuario?.id;

  useEffect(() => {
    cargarVotaciones();
  }, []);

  const cargarVotaciones = async () => {
    setLoading(true);
    try {
      const res = await votacionService.obtenerVotaciones();
      let votacionesData = res.data;
      
      // Si no es administrador, mostrar votaciones activas y cerradas con resultados publicados
      if (!esAdministrador) {
        votacionesData = votacionesData.filter(votacion => 
          votacion.estado === 'activa' || 
          (votacion.estado === 'cerrada' && votacion.resultadosPublicados)
        );
      }
      
      setVotaciones(votacionesData);

      // Verificar qué votaciones ya votó el usuario
      if (usuarioId && votacionesData.length > 0) {
        const votosStatus = {};
        
        // Crear promesas para verificar cada votación
        const verificaciones = votacionesData.map(async (votacion) => {
          try {
            const yaVotoRes = await votoService.verificarSiYaVoto(usuarioId, votacion.id);
            votosStatus[votacion.id] = yaVotoRes.data.yaVoto;
          } catch (error) {
            console.error(`Error verificando voto para votación ${votacion.id}:`, error);
            votosStatus[votacion.id] = false;
          }
        });

        await Promise.all(verificaciones);
        setVotosUsuario(votosStatus);
      }
      
      setLoading(false);
    } catch (err) {
      Alert.alert('Error', `Error al cargar votaciones: ${err.message}`);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarVotaciones();
    setRefreshing(false);
  };

  const handleCerrarVotacion = async (votacion) => {
    // Solo permitir cerrar votaciones si es administrador
    if (!esAdministrador) {
      Alert.alert('Error', 'No tienes permisos para cerrar votaciones');
      return;
    }

    Alert.alert(
      '¿Cerrar votación?',
      `Votación: ${votacion.titulo}\n\nEsta acción no se puede deshacer. Una vez cerrada, no se podrán registrar más votos.\n\nNota: Los resultados no se publicarán automáticamente. Podrás publicarlos cuando desees.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, cerrar',
          style: 'destructive',
          onPress: async () => {
            try {
              setCerrandoVotacion(votacion.id);

              await votacionService.cerrarVotacion(votacion.id);

              setVotaciones(prevVotaciones => 
                prevVotaciones.map(v => 
                  v.id === votacion.id 
                    ? { ...v, estado: 'cerrada', resultadosPublicados: false }
                    : v
                )
              );

              Alert.alert(
                '¡Votación cerrada!',
                `La votación "${votacion.titulo}" ha sido cerrada exitosamente. Ahora puedes publicar los resultados cuando desees.`
              );

              setCerrandoVotacion(null);
            } catch (error) {
              console.error('Error al cerrar votación:', error);
              setCerrandoVotacion(null);
              Alert.alert('Error', `No se pudo cerrar la votación "${votacion.titulo}"`);
            }
          }
        }
      ]
    );
  };

  const handlePublicarResultados = async (votacion) => {
    // Solo permitir publicar si es administrador
    if (!esAdministrador) {
      Alert.alert('Error', 'No tienes permisos para publicar resultados');
      return;
    }

    Alert.alert(
      '¿Publicar resultados?',
      `Votación: ${votacion.titulo}\n\nUna vez publicados, los resultados serán visibles para todos los usuarios.\n\nNota: Los estudiantes podrán ver los resultados de esta votación.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, publicar',
          onPress: async () => {
            try {
              setPublicandoResultados(votacion.id);

              await votacionService.publicarResultados(votacion.id);

              // Actualizar el estado local
              setVotaciones(prevVotaciones => 
                prevVotaciones.map(v => 
                  v.id === votacion.id 
                    ? { ...v, resultadosPublicados: true }
                    : v
                )
              );

              Alert.alert(
                '¡Resultados publicados!',
                `Los resultados de "${votacion.titulo}" ahora son visibles para todos los usuarios.`
              );

              setPublicandoResultados(null);
            } catch (error) {
              console.error('Error al publicar resultados:', error);
              setPublicandoResultados(null);
              Alert.alert('Error', error.message || `No se pudieron publicar los resultados de "${votacion.titulo}"`);
            }
          }
        }
      ]
    );
  };

  const getEstadoInfo = (estado, resultadosPublicados) => {
    if (estado === 'activa') {
      return {
        text: 'Activa',
        color: '#52c41a',
        icon: 'check-circle'
      };
    } else if (estado === 'cerrada') {
      if (resultadosPublicados) {
        return {
          text: 'Publicada',
          color: '#1890ff',
          icon: 'bar-chart'
        };
      } else {
        return {
          text: 'Cerrada',
          color: '#8c8c8c',
          icon: 'stop'
        };
      }
    }
    
    return {
      text: estado,
      color: '#8c8c8c',
      icon: 'help'
    };
  };

  // Opciones de filtro disponibles según el rol del usuario
  const getFiltroOptions = () => {
    if (esAdministrador) {
      return [
        { label: 'Activas', value: 'activa', icon: 'check-circle', color: '#52c41a' },
        { label: 'Cerradas', value: 'cerrada', icon: 'stop', color: '#8c8c8c' },
        { label: 'Todas', value: 'todas', icon: 'filter-list', color: '#1e3a8a' }
      ];
    } else {
      return [
        { label: 'Activas', value: 'activa', icon: 'check-circle', color: '#52c41a' },
        { label: 'Publicadas', value: 'publicadas', icon: 'bar-chart', color: '#1890ff' },
        { label: 'Todas', value: 'todas', icon: 'filter-list', color: '#1e3a8a' }
      ];
    }
  };

  const filtroOptions = getFiltroOptions();

  // Filtrar votaciones
  const votacionesFiltradas = () => {
    if (filtroEstado === 'todas') {
      return votaciones;
    } else if (filtroEstado === 'activa') {
      return votaciones.filter(votacion => votacion.estado === 'activa');
    } else if (filtroEstado === 'cerrada') {
      return votaciones.filter(votacion => votacion.estado === 'cerrada');
    } else if (filtroEstado === 'publicadas') {
      return votaciones.filter(votacion => votacion.estado === 'cerrada' && votacion.resultadosPublicados);
    }
    return votaciones;
  };

  const renderVotacionCard = (votacion) => {
    const yaVoto = votosUsuario[votacion.id];
    const estadoInfo = getEstadoInfo(votacion.estado, votacion.resultadosPublicados);

    return (
      <View key={votacion.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {votacion.titulo}
          </Text>
          <View style={[styles.badge, { backgroundColor: estadoInfo.color }]}>
            <Icon name={estadoInfo.icon} size={16} color="#fff" />
            <Text style={styles.badgeText}>{estadoInfo.text}</Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          {esEstudiante ? (
            // Botones para estudiantes
            <>
              {votacion.estado === 'activa' && (
                <TouchableOpacity
                  style={[
                    styles.button,
                    yaVoto ? styles.buttonDisabled : styles.buttonPrimary
                  ]}
                  onPress={() => {
                    if (!yaVoto) {
                      navigation.navigate('Votar', { votacionId: votacion.id });
                    }
                  }}
                  disabled={yaVoto}
                >
                  <Icon 
                    name={yaVoto ? 'check' : 'check-circle'} 
                    size={20} 
                    color={yaVoto ? '#666' : '#fff'} 
                  />
                  <Text style={[styles.buttonText, yaVoto && styles.buttonTextDisabled]}>
                    {yaVoto ? 'Votaste' : 'Votar'}
                  </Text>
                </TouchableOpacity>
              )}

              {votacion.estado === 'cerrada' && votacion.resultadosPublicados && (
                <TouchableOpacity
                  style={[styles.button, styles.buttonPrimary]}
                  onPress={() => navigation.navigate('Resultados', { votacionId: votacion.id })}
                >
                  <Icon name="bar-chart" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Ver Resultados</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            // Botones para administradores
            <>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonOutline, styles.buttonHalf]}
                  onPress={() => navigation.navigate('Detalle', { votacionId: votacion.id })}
                >
                  <Icon name="visibility" size={18} color="#1e3a8a" />
                  <Text style={[styles.buttonText, styles.buttonTextOutline]}>Ver Detalle</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary, styles.buttonHalf]}
                  onPress={() => navigation.navigate('Resultados', { votacionId: votacion.id })}
                >
                  <Icon name="bar-chart" size={18} color="#64748b" />
                  <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Resultados</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.buttonHalf,
                    votacion.estado === 'activa' && !yaVoto ? styles.buttonPrimary : styles.buttonDisabled
                  ]}
                  onPress={() => {
                    if (votacion.estado === 'activa' && !yaVoto) {
                      navigation.navigate('Votar', { votacionId: votacion.id });
                    }
                  }}
                  disabled={yaVoto || votacion.estado === 'cerrada'}
                >
                  <Icon 
                    name={yaVoto ? 'check' : 'check-circle'} 
                    size={18} 
                    color={votacion.estado === 'activa' && !yaVoto ? '#fff' : '#666'} 
                  />
                  <Text style={[
                    styles.buttonText,
                    votacion.estado === 'activa' && !yaVoto ? {} : styles.buttonTextDisabled
                  ]}>
                    {yaVoto ? 'Votaste' : 'Votar'}
                  </Text>
                </TouchableOpacity>
                
                {votacion.estado === 'activa' && (
                  <TouchableOpacity
                    style={[styles.button, styles.buttonDanger, styles.buttonHalf]}
                    onPress={() => handleCerrarVotacion(votacion)}
                    disabled={cerrandoVotacion === votacion.id}
                  >
                    {cerrandoVotacion === votacion.id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Icon name="stop" size={18} color="#fff" />
                    )}
                    <Text style={styles.buttonText}>
                      {cerrandoVotacion === votacion.id ? 'Cerrando...' : 'Cerrar'}
                    </Text>
                  </TouchableOpacity>
                )}

                {votacion.estado === 'cerrada' && !votacion.resultadosPublicados && (
                  <TouchableOpacity
                    style={[styles.button, styles.buttonSuccess, styles.buttonHalf]}
                    onPress={() => handlePublicarResultados(votacion)}
                    disabled={publicandoResultados === votacion.id}
                  >
                    {publicandoResultados === votacion.id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Icon name="send" size={18} color="#fff" />
                    )}
                    <Text style={styles.buttonText}>
                      {publicandoResultados === votacion.id ? 'Publicando...' : 'Publicar'}
                    </Text>
                  </TouchableOpacity>
                )}

                {votacion.estado === 'cerrada' && votacion.resultadosPublicados && (
                  <TouchableOpacity
                    style={[styles.button, styles.buttonDisabled, styles.buttonHalf]}
                    disabled={true}
                  >
                    <Icon name="check" size={18} color="#666" />
                    <Text style={styles.buttonTextDisabled}>Publicada</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Listado de Votaciones</Text>
          <Text style={styles.subtitle}>
            {esAdministrador 
              ? 'Gestiona y monitorea todas las votaciones del sistema'
              : 'Consulta las votaciones activas y resultados publicados'
            }
          </Text>
        </View>
        {esAdministrador && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CrearVotacion')}
          >
            <Icon name="add" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <View style={styles.filtersHeader}>
          <Icon name="filter-list" size={20} color="#1e3a8a" />
          <Text style={styles.filtersTitle}>Filtrar por Estado</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          {filtroOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.filterButton,
                filtroEstado === option.value && styles.filterButtonActive
              ]}
              onPress={() => setFiltroEstado(option.value)}
            >
              <Icon 
                name={option.icon} 
                size={16} 
                color={filtroEstado === option.value ? '#fff' : option.color} 
              />
              <Text style={[
                styles.filterButtonText,
                filtroEstado === option.value && styles.filterButtonTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de votaciones */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={styles.loadingText}>Cargando votaciones...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {votacionesFiltradas().map(renderVotacionCard)}
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
  filtersContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  filtersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a8a',
    marginLeft: 8,
  },
  filtersScroll: {
    flexGrow: 0,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  filterButtonActive: {
    backgroundColor: '#1e3a8a',
    borderColor: '#1e3a8a',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginLeft: 6,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e3a8a',
    flex: 1,
    marginRight: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
  },
  cardActions: {
    gap: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonHalf: {
    flex: 1,
  },
  buttonPrimary: {
    backgroundColor: '#1e3a8a',
  },
  buttonSecondary: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#64748b',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1e3a8a',
  },
  buttonDanger: {
    backgroundColor: '#dc3545',
  },
  buttonSuccess: {
    backgroundColor: '#28a745',
  },
  buttonDisabled: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#d9d9d9',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  buttonTextOutline: {
    color: '#1e3a8a',
  },
  buttonTextSecondary: {
    color: '#64748b',
  },
  buttonTextDisabled: {
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  bottomPadding: {
    height: 20,
  },
});

export default ListaVotaciones;