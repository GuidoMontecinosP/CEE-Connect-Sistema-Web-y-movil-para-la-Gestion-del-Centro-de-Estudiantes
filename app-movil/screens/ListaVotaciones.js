import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StyleSheet,
  Dimensions
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { votacionService } from '../services/votacion.services';
import { votoService } from '../services/voto.services';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/Authcontext';
import { debounce } from 'lodash';

const { width } = Dimensions.get('window');

const ListarVotaciones = () => {
  const [votaciones, setVotaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [filtroResultados, setFiltroResultados] = useState(null);
 const [inputBusqueda, setInputBusqueda] = useState('');
const [terminoBusqueda, setTerminoBusqueda] = useState('');

  const [cerrandoVotacion, setCerrandoVotacion] = useState(null);
  const [publicandoResultados, setPublicandoResultados] = useState(null);
  const [votosUsuario, setVotosUsuario] = useState({});
  
  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPorPagina] = useState(10);
  const [hayMasPaginas, setHayMasPaginas] = useState(false);
  
  const navigation = useNavigation();
  const { usuario } = useContext(AuthContext);

  // Verificar roles del usuario
  const esAdministrador = usuario?.rol?.nombre === 'administrador';
  const esEstudiante = usuario?.rol?.nombre === 'estudiante';
  const usuarioId = usuario?.id;

  // Función para mostrar alertas
  const mostrarAlerta = (titulo, mensaje, tipo = 'info') => {
    Alert.alert(titulo, mensaje);
  };

  // Función para cargar votaciones con filtros y paginación
  const cargarVotaciones = useCallback(async (resetPage = false, concatenar = false) => {
    if (!concatenar) setLoading(true);
    
    try {
      const page = resetPage ? 1 : paginaActual;
      
      // Construir parámetros de consulta
      const parametros = {
        page,
        limit: itemsPorPagina
      };

      // Agregar filtros solo si están definidos
      if (filtroEstado && filtroEstado !== 'todas') {
        if (filtroEstado === 'publicadas') {
          parametros.estado = 'cerrada';
          parametros.resultadosPublicados = true;
        } else if (filtroEstado === 'cerrada') {
          parametros.estado = 'cerrada';
          if (filtroResultados !== null) {
            parametros.resultadosPublicados = filtroResultados;
          }
        } else {
          parametros.estado = filtroEstado;
        }
      }

      if (terminoBusqueda?.trim()) {
        parametros.busqueda = terminoBusqueda.trim();
      }

      const res = await votacionService.obtenerVotaciones(parametros);
      let votacionesData = res.data;
      
      // Filtrar según el rol del usuario
      if (esEstudiante) {
        votacionesData = votacionesData.filter(votacion => 
          votacion.estado === 'activa' || 
          (votacion.estado === 'cerrada' && votacion.resultadosPublicados)
        );
      }
      
      if (concatenar && page > 1) {
        setVotaciones(prev => [...prev, ...votacionesData]);
      } else {
        setVotaciones(votacionesData);
      }
      
      setTotalItems(res.pagination.totalItems);
      setHayMasPaginas(res.pagination.currentPage < res.pagination.totalPages);
      
      if (resetPage) {
        setPaginaActual(1);
      }

      // Verificar qué votaciones ya votó el usuario
      if (usuarioId && votacionesData.length > 0) {
        const votosStatus = {};
        
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
        setVotosUsuario(prev => ({ ...prev, ...votosStatus }));
      }
      
    } catch (err) {
      mostrarAlerta('Error', `Error al cargar votaciones: ${err.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [paginaActual, itemsPorPagina, filtroEstado, filtroResultados, terminoBusqueda, esEstudiante, usuarioId]);

  // Búsqueda con debounce
  const debouncedBusqueda = useCallback(
  debounce((termino) => {
    setTerminoBusqueda(termino);
    setPaginaActual(1);
  }, 500),
  [] // Sin dependencias
);
const handleBusquedaChange = (texto) => {
  setInputBusqueda(texto);
  debouncedBusqueda(texto);
};


  // Efectos
  useEffect(() => {
    cargarVotaciones(true);
  }, [filtroEstado, filtroResultados, terminoBusqueda]);

  // Función para refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    cargarVotaciones(true);
  }, [cargarVotaciones]);

  // Cargar más páginas
  const cargarMasPaginas = () => {
    if (hayMasPaginas && !loading) {
      setPaginaActual(prev => prev + 1);
      cargarVotaciones(false, true);
    }
  };

  const handleCerrarVotacion = async (votacion) => {
    if (!esAdministrador) {
      mostrarAlerta('Error', 'No tienes permisos para cerrar votaciones');
      return;
    }

    Alert.alert(
      '¿Cerrar votación?',
      `Votación: ${votacion.titulo}\n\nEsta acción no se puede deshacer. Una vez cerrada, no se podrán registrar más votos.\n\nNota: Los resultados no se publicarán automáticamente.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar',
          style: 'destructive',
          onPress: async () => {
            try {
              setCerrandoVotacion(votacion.id);
              await votacionService.cerrarVotacion(votacion.id);
              cargarVotaciones(true);
              mostrarAlerta('Éxito', `La votación "${votacion.titulo}" ha sido cerrada exitosamente.`);
            } catch (error) {
              console.error('Error al cerrar votación:', error);
              mostrarAlerta('Error', `No se pudo cerrar la votación "${votacion.titulo}"`);
            } finally {
              setCerrandoVotacion(null);
            }
          }
        }
      ]
    );
  };

  const handlePublicarResultados = async (votacion) => {
    if (!esAdministrador) {
      mostrarAlerta('Error', 'No tienes permisos para publicar resultados');
      return;
    }

    Alert.alert(
      '¿Publicar resultados?',
      `Votación: ${votacion.titulo}\n\nUna vez publicados, los resultados serán visibles para todos los usuarios.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Publicar',
          onPress: async () => {
            try {
              setPublicandoResultados(votacion.id);
              await votacionService.publicarResultados(votacion.id);
              cargarVotaciones(true);
              mostrarAlerta('Éxito', `Los resultados de "${votacion.titulo}" ahora son visibles para todos los usuarios.`);
            } catch (error) {
              console.error('Error al publicar resultados:', error);
              mostrarAlerta('Error', error.message || `No se pudieron publicar los resultados de "${votacion.titulo}"`);
            } finally {
              setPublicandoResultados(null);
            }
          }
        }
      ]
    );
  };

  const getEstadoStyle = (estado, resultadosPublicados) => {
    if (estado === 'activa') {
      return { backgroundColor: '#22c55e', color: 'white' };
    } else if (estado === 'cerrada') {
      if (resultadosPublicados) {
        return { backgroundColor: '#3b82f6', color: 'white' };
      } else {
        return { backgroundColor: '#6b7280', color: 'white' };
      }
    }
    return { backgroundColor: '#6b7280', color: 'white' };
  };

  const getEstadoTexto = (estado, resultadosPublicados) => {
    if (estado === 'activa') return 'Activa';
    if (estado === 'cerrada') {
      return resultadosPublicados ? 'Publicada' : 'Cerrada';
    }
    return estado;
  };

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
  setFiltroEstado('todas');
  setFiltroResultados(null);
  setInputBusqueda('');
  setTerminoBusqueda('');
  setPaginaActual(1);
};


const hayFiltrosActivos = filtroEstado !== 'todas' || filtroResultados !== null || inputBusqueda.trim() !== '';


  const renderVotacionCard = (votacion) => {
    const yaVoto = votosUsuario[votacion.id];
    const estadoStyle = getEstadoStyle(votacion.estado, votacion.resultadosPublicados);
    
    return (
      <View key={votacion.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {votacion.titulo}
          </Text>
          <View style={[styles.badge, estadoStyle]}>
            <Text style={styles.badgeText}>
              {getEstadoTexto(votacion.estado, votacion.resultadosPublicados)}
            </Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          {esEstudiante ? (
            <>
              {/* Votaciones activas: solo mostrar botón de votar */}
              {votacion.estado === 'activa' && (
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.primaryButton,
                    yaVoto && styles.disabledButton
                  ]}
                  onPress={() => {
                    if (!yaVoto) {
                      navigation.navigate('Votar', { votacionId: votacion.id });
                    }
                  }}
                  disabled={yaVoto}
                >
                  <Icon 
                    name={yaVoto ? "checkmark" : "checkmark-circle"} 
                    size={16} 
                    color={yaVoto ? "#666" : "white"} 
                    style={styles.buttonIcon} 
                  />
                  <Text style={[styles.buttonText, yaVoto && styles.disabledButtonText]}>
                    {yaVoto ? 'Votaste' : 'Votar'}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Votaciones cerradas con resultados publicados */}
              {votacion.estado === 'cerrada' && votacion.resultadosPublicados && (
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={() => navigation.navigate('Resultados', { votacionId: votacion.id })}
                >
                  <Icon name="bar-chart" size={16} color="white" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Ver Resultados</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            /* Si es administrador */
            <View style={styles.adminActions}>
              {/* Primera fila */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.button, styles.outlineButton, styles.halfButton]}
                  onPress={() => navigation.navigate('Detalle', { votacionId: votacion.id })}
                >
                  <Icon name="eye" size={16} color="#1e3a8a" style={styles.buttonIcon} />
                  <Text style={[styles.buttonText, { color: '#1e3a8a' }]}>Ver Detalles</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton, styles.halfButton]}
                  onPress={() => navigation.navigate('Resultados', { votacionId: votacion.id })}
                >
                  <Icon name="bar-chart" size={16} color="#64748b" style={styles.buttonIcon} />
                  <Text style={[styles.buttonText, { color: '#64748b' }]}>Resultados</Text>
                </TouchableOpacity>
              </View>

              {/* Segunda fila */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.halfButton,
                    votacion.estado === 'activa' && !yaVoto ? styles.primaryButton : styles.disabledButton
                  ]}
                  onPress={() => {
                    if (votacion.estado === 'activa' && !yaVoto) {
                      navigation.navigate('Votar', { votacionId: votacion.id });
                    }
                  }}
                  disabled={yaVoto || votacion.estado === 'cerrada'}
                >
                  <Icon 
                    name={yaVoto ? "checkmark" : "checkmark-circle"} 
                    size={16} 
                    color={votacion.estado === 'activa' && !yaVoto ? "white" : "#666"} 
                    style={styles.buttonIcon} 
                  />
                  <Text style={[
                    styles.buttonText, 
                    (yaVoto || votacion.estado === 'cerrada') && styles.disabledButtonText
                  ]}>
                    {yaVoto ? 'Votaste' : 'Votar'}
                  </Text>
                </TouchableOpacity>
                
                {/* Botón dinámico según estado */}
                {votacion.estado === 'activa' && (
                  <TouchableOpacity
                    style={[styles.button, styles.dangerButton, styles.halfButton]}
                    onPress={() => handleCerrarVotacion(votacion)}
                    disabled={cerrandoVotacion === votacion.id}
                  >
                    {cerrandoVotacion === votacion.id ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Icon name="stop" size={16} color="white" style={styles.buttonIcon} />
                    )}
                    <Text style={styles.buttonText}>
                      {cerrandoVotacion === votacion.id ? 'Cerrando...' : 'Cerrar'}
                    </Text>
                  </TouchableOpacity>
                )}

                {votacion.estado === 'cerrada' && !votacion.resultadosPublicados && (
                  <TouchableOpacity
                    style={[styles.button, styles.successButton, styles.halfButton]}
                    onPress={() => handlePublicarResultados(votacion)}
                    disabled={publicandoResultados === votacion.id}
                  >
                    {publicandoResultados === votacion.id ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Icon name="send" size={16} color="white" style={styles.buttonIcon} />
                    )}
                    <Text style={styles.buttonText}>
                      {publicandoResultados === votacion.id ? 'Publicando...' : 'Publicar'}
                    </Text>
                  </TouchableOpacity>
                )}

                {votacion.estado === 'cerrada' && votacion.resultadosPublicados && (
                  <TouchableOpacity
                    style={[styles.button, styles.disabledButton, styles.halfButton]}
                    disabled
                  >
                    <Icon name="checkmark" size={16} color="#666" style={styles.buttonIcon} />
                    <Text style={styles.disabledButtonText}>Publicado</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
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
            style={styles.newButton}
            onPress={() => navigation.navigate('CrearVotacion')}
          >
            <Icon name="add" size={20} color="white" />
            <Text style={styles.newButtonText}>Nueva</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros y búsqueda */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={16} color="#1e3a8a" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar votaciones..."
            value={inputBusqueda}
            onChangeText={handleBusquedaChange}
            placeholderTextColor="#64748b"
          />
          {inputBusqueda.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setInputBusqueda('');
                setTerminoBusqueda('');
                setPaginaActual(1);
              }}
            >
              <Icon name="close" size={16} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={filtroEstado}
            onValueChange={(value) => {
              setFiltroEstado(value || 'todas');
              if (value !== 'cerrada') {
                setFiltroResultados(null);
              }
              setPaginaActual(1);
            }}
            style={styles.picker}
          >
            <Picker.Item label="Todas" value="todas" />
            <Picker.Item label="Activas" value="activa" />
            {esAdministrador && <Picker.Item label="Cerradas" value="cerrada" />}
            <Picker.Item label="Publicadas" value="publicadas" />
          </Picker>
        </View>

        {esAdministrador && filtroEstado === 'cerrada' && (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={filtroResultados}
              onValueChange={setFiltroResultados}
              style={styles.picker}
            >
              <Picker.Item label="Todos los resultados" value={null} />
              <Picker.Item label="Publicadas" value={true} />
              <Picker.Item label="Sin publicar" value={false} />
            </Picker>
          </View>
        )}

        {hayFiltrosActivos && (
          <TouchableOpacity style={styles.clearButton} onPress={limpiarFiltros}>
            <Icon name="close" size={16} color="#64748b" />
            <Text style={styles.clearButtonText}>Limpiar Filtros</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de votaciones */}
      {loading && votaciones.length === 0 ? (
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
          onMomentumScrollEnd={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
            if (isCloseToBottom) {
              cargarMasPaginas();
            }
          }}
        >
          {votaciones.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="checkmark-circle" size={64} color="#64748b" />
              <Text style={styles.emptyText}>
                {terminoBusqueda 
                  ? `No se encontraron votaciones para "${terminoBusqueda}"`
                  : "No hay votaciones disponibles"
                }
              </Text>
            </View>
          ) : (
            <>
              {votaciones.map(renderVotacionCard)}
              
              {/* Información de paginación */}
              {totalItems > 0 && (
                <View style={styles.paginationInfo}>
                  <Text style={styles.paginationText}>
                    Mostrando {votaciones.length} de {totalItems} votaciones
                    {terminoBusqueda && ` para "${terminoBusqueda}"`}
                  </Text>
                  {hayMasPaginas && (
                    <TouchableOpacity style={styles.loadMoreButton} onPress={cargarMasPaginas}>
                      <Text style={styles.loadMoreText}>Cargar más</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  newButton: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  newButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 4,
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
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
  pickerContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  picker: {
    height: 50,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    marginTop: 8,
  },
  clearButtonText: {
    color: '#64748b',
    marginLeft: 4,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    color: '#64748b',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    color: '#64748b',
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardActions: {
    marginTop: 8,
  },
  adminActions: {
    gap: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minHeight: 44,
  },
  halfButton: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#1e3a8a',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1e3a8a',
  },
  secondaryButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#64748b',
  },
  dangerButton: {
    backgroundColor: '#dc2626',
  },
  successButton: {
    backgroundColor: '#16a34a',
  },
  disabledButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#d9d9d9',
  },
  buttonIcon: {
    marginRight: 6,
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  disabledButtonText: {
    color: '#666',
  },
  paginationInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  paginationText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  loadMoreButton: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  loadMoreText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default ListarVotaciones;