import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

import { AuthContext } from '../context/Authcontext';
import { sugerenciasService } from '../services/sugerencia.services';
import { reportesService } from '../services/reporte.services';
import { muteoService } from '../services/muteado.services';

const ListaSugerencias = ({ navigation }) => {
  // Estados principales
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Estados para paginación y filtros
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [categoriaFiltro, setCategoriaFiltro] = useState(null);
  const [estadoFiltro, setEstadoFiltro] = useState(null);
const [deberiaLimpiar, setDeberiaLimpiar] = useState(false);
  // Estados para reportes y muteos
  const [misReportes, setMisReportes] = useState([]);
  const [reportesDisponibles, setReportesDisponibles] = useState([]);
  const [reporteActualIndex, setReporteActualIndex] = useState(0);

  // Estados para modales
  const [msgModalVisible, setMsgModalVisible] = useState(false);
  const [mensajeActivo, setMensajeActivo] = useState('');
  const [msgAutor, setMsgAutor] = useState(null);
  const [msgFecha, setMsgFecha] = useState(null);

  const [respModalVisible, setRespModalVisible] = useState(false);
  const [sugerenciaSel, setSugerenciaSel] = useState(null);
  const [respuestaTexto, setRespuestaTexto] = useState('');
  const [estadoRespuesta, setEstadoRespuesta] = useState('resuelta');
  const [loadingResp, setLoadingResp] = useState(false);

  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewRespuesta, setViewRespuesta] = useState('');
  const [viewFecha, setViewFecha] = useState(null);
  const [viewAdmin, setViewAdmin] = useState(null);

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [sugerenciaAReportar, setSugerenciaAReportar] = useState(null);
  const [motivoReporte, setMotivoReporte] = useState('');
  const [loadingReporte, setLoadingReporte] = useState(false);

  const [infoReporteVisible, setInfoReporteVisible] = useState(false);
  const [reporteInfo, setReporteInfo] = useState(null);
  const [loadingEliminarReporte, setLoadingEliminarReporte] = useState(false);
  const [loadingDesmuteo, setLoadingDesmuteo] = useState(false);
  const [loadingVaciarReportes, setLoadingVaciarReportes] = useState(false);
  const [confirmandoEliminacion, setConfirmandoEliminacion] = useState(false);
  
  const [filtrosVisible, setFiltrosVisible] = useState(false);

  // Estados para muteo
  const [muteoModalVisible, setMuteoModalVisible] = useState(false);
  const [usuarioAMutear, setUsuarioAMutear] = useState(null);
  const [loadingMuteo, setLoadingMuteo] = useState(false);
  const [tipoMuteo, setTipoMuteo] = useState('');
  const [razonMuteo, setRazonMuteo] = useState('');
  const [fechaFinMuteo, setFechaFinMuteo] = useState('');

  const { userToken, usuario } = useContext(AuthContext);
  const esAdmin = usuario?.rol?.nombre === 'administrador';
  const esEstud = usuario?.rol?.nombre === 'estudiante';

  // Función para cargar sugerencias
  const cargar = useCallback(async (page = 1, limit = 10, filtros = {}) => {
    try {
      setLoading(true);
      
      const parametrosFiltro = {
        ...filtros,
        categoria: filtros.categoria || categoriaFiltro,
        estado: filtros.estado || estadoFiltro,
        busqueda: filtros.busqueda !== undefined ? filtros.busqueda : searchText
      };

      // Limpiar valores null/undefined
      Object.keys(parametrosFiltro).forEach(key => {
        if (parametrosFiltro[key] === null || parametrosFiltro[key] === undefined || parametrosFiltro[key] === '') {
          delete parametrosFiltro[key];
        }
      });

      const res = await sugerenciasService.obtenerSugerencias(page, limit, parametrosFiltro);
      const data = res.data || res;
      
      setSugerencias(data.data || []);
      setTotalRecords(data.pagination?.total || 0);
      setCurrentPage(page);
      setPageSize(limit);

      // Cargar reportes del usuario si es estudiante
      if (esEstud) {
        try {
          const reportesRes = await reportesService.obtenerMisReportes();
          setMisReportes(reportesRes.data || []);
        } catch (error) {
          Alert.alert('Error', error || 'No se pudieron cargar tus reportes');
          setMisReportes([]);
        }
      }

      // Cargar reportes disponibles si es admin
      if (esAdmin) {
        try {
          const reportesRes = await reportesService.obtenerReportes(1, 100);
          setReportesDisponibles(reportesRes.data?.data || []);
        } catch (error) {
          Alert.alert('Error', error || 'No se pudieron cargar los reportes disponibles');
          setReportesDisponibles([]);
        }
      }

    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudieron cargar las sugerencias');
      setSugerencias([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [categoriaFiltro, estadoFiltro, searchText, esAdmin, esEstud]);

  // Función de refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await cargar(currentPage, pageSize, { 
        categoria: categoriaFiltro, 
        estado: estadoFiltro,
        busqueda: searchText 
      });
    } catch (error) {
      Alert.alert('Error', error || 'No se pudieron refrescar las sugerencias');
    } finally {
      setRefreshing(false);
    }
  }, [cargar, currentPage, pageSize, categoriaFiltro, estadoFiltro, searchText]);

  // Función de búsqueda
  const buscarSugerencias = useCallback((valor) => {
    setSearchText(valor);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const nuevoTimeout = setTimeout(() => {
      setCurrentPage(1);
      cargar(1, pageSize, {
        categoria: categoriaFiltro,
        estado: estadoFiltro,
        busqueda: valor
      });
    }, 500);
    
    setSearchTimeout(nuevoTimeout);
  }, [pageSize, categoriaFiltro, estadoFiltro, searchTimeout, cargar]);

  // Cambio de página
  const cambiarPagina = useCallback((nuevaPagina) => {
    if (nuevaPagina < 1 || nuevaPagina > Math.ceil(totalRecords / pageSize)) return;
    
    setCurrentPage(nuevaPagina);
    cargar(nuevaPagina, pageSize, {
      categoria: categoriaFiltro,
      estado: estadoFiltro,
      busqueda: searchText
    });
  }, [totalRecords, pageSize, categoriaFiltro, estadoFiltro, searchText, cargar]);

  // Aplicar filtros
  const aplicarFiltros = useCallback(() => {
    setCurrentPage(1);
    cargar(1, pageSize, {
      categoria: categoriaFiltro,
      estado: estadoFiltro,
      busqueda: searchText
    });
    setFiltrosVisible(false);
  }, [categoriaFiltro, estadoFiltro, searchText, pageSize, cargar]);

  // Limpiar filtros
 const limpiarFiltros = useCallback(() => {
  setCategoriaFiltro(null);
  setEstadoFiltro(null);
  setSearchText('');
  setCurrentPage(1);
  setFiltrosVisible(false);
  setDeberiaLimpiar(true);
}, []);


  // Effect para carga inicial
  useEffect(() => {
    cargar(1, pageSize, {});
  }, []);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  useEffect(() => {
  if (deberiaLimpiar) {
    cargar(1, pageSize, {
      categoria: null,
      estado: null,
      busqueda: ''
    });
    setDeberiaLimpiar(false);
  }
}, [deberiaLimpiar, pageSize, cargar]);

  // Funciones auxiliares
  const getEstadoColor = (estado) => {
    const colors = {
      pendiente: '#ff7f50',
      'en proceso': '#1e90ff', 
      resuelta: '#32cd32',
      archivada: '#808080'
    };
    return colors[estado] || '#808080';
  };

  const getCategoriaTexto = (categoria) => {
    const categorias = {
      'eventos': 'Eventos',
      'infraestructura': 'Infraestructura', 
      'bienestar': 'Bienestar',
      'otros': 'Otros'
    };
    return categorias[categoria] || categoria;
  };

  const formatearFecha = (fecha) => {
    return fecha ? new Date(fecha).toLocaleString('es-CL') : 'N/A';
  };

  const tieneRespuesta = (sugerencia) => {
    return !!sugerencia?.respuestaAdmin && String(sugerencia.respuestaAdmin).trim() !== '';
  };

  const puedeReportar = (sugerencia) => {
    if (!esEstud) return false;
    if (sugerencia.autor?.id === usuario?.id) return false;
    if (sugerencia.estado === 'archivada') return false;
    if (misReportes.includes(sugerencia.id)) return false;
    return true;
  };

  // FUNCIONES DE MUTEO - AGREGADAS
  const abrirMuteoModal = (usuario, tipo) => {
    setUsuarioAMutear(usuario);
    setTipoMuteo(tipo);
    setRazonMuteo('');
    setFechaFinMuteo('');
    setMuteoModalVisible(true);
  };

  const mutearUsuario = async () => {
    if (!razonMuteo.trim()) {
      Alert.alert('Error', 'Debes especificar una razón para el muteo');
      return;
    }

    if (!fechaFinMuteo) {
      Alert.alert('Error', 'Debes especificar una fecha de fin para el muteo');
      return;
    }

    try {
      setLoadingMuteo(true);
      await muteoService.mutearUsuario(
        usuarioAMutear.id, 
        razonMuteo, 
        fechaFinMuteo
      );
      
      Alert.alert('Éxito', `Usuario ${usuarioAMutear.nombre} muteado exitosamente`);
      setMuteoModalVisible(false);
      
      // Actualizar estado local
      if (reporteInfo) {
        if (tipoMuteo === 'reportador' && reporteInfo.usuario?.id === usuarioAMutear.id) {
          setReporteInfo(prev => ({
            ...prev,
            usuario: {
              ...prev.usuario,
              isMuted: true
            }
          }));
        } else if (tipoMuteo === 'autor' && reporteInfo.sugerencia?.autor?.id === usuarioAMutear.id) {
          setReporteInfo(prev => ({
            ...prev,
            sugerencia: {
              ...prev.sugerencia,
              autor: {
                ...prev.sugerencia.autor,
                isMuted: true
              }
            }
          }));
        }
      }
      
    } catch (error) {
      console.error('Error al mutear usuario:', error);
      Alert.alert('Error', error.message || 'Error al mutear usuario');
    } finally {
      setLoadingMuteo(false);
    }
  };

  const desmutearUsuario = async (userId, nombreUsuario) => {
    Alert.alert(
      'Confirmar desmuteo',
      `¿Estás seguro de que deseas desmutear a ${nombreUsuario}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: async () => {
          try {
            setLoadingDesmuteo(true);
            await muteoService.desmutearUsuario(userId);
            Alert.alert('Éxito', `Usuario ${nombreUsuario} desmuteado exitosamente`);
            
            // Actualizar estado local
            if (reporteInfo) {
              if (reporteInfo.usuario?.id === userId) {
                setReporteInfo(prev => ({
                  ...prev,
                  usuario: {
                    ...prev.usuario,
                    isMuted: false
                  }
                }));
              }
              
              if (reporteInfo.sugerencia?.autor?.id === userId) {
                setReporteInfo(prev => ({
                  ...prev,
                  sugerencia: {
                    ...prev.sugerencia,
                    autor: {
                      ...prev.sugerencia.autor,
                      isMuted: false
                    }
                  }
                }));
              }
            }
            
          } catch (error) {
            console.error('Error al desmutear usuario:', error);
            Alert.alert('Error', error.message || 'Error al desmutear usuario');
          } finally {
            setLoadingDesmuteo(false);
          }
        }}
      ]
    );
  };

  // FUNCIONES DE REPORTES - AGREGADAS
  const verInfoReporte = async (sugerencia) => {
    try {
      setLoadingEliminarReporte(true);
      
      const reporte = reportesDisponibles.find(r => r.sugerencia?.id === sugerencia.id);
      
      if (reporte) {
        const nuevoIndex = reportesDisponibles.findIndex(r => r.id === reporte.id);
        setReporteActualIndex(nuevoIndex >= 0 ? nuevoIndex : 0);
        
        setReporteInfo(reporte);
        setInfoReporteVisible(true);
      } else {
        Alert.alert('Error', 'No se encontró información del reporte');
      }
    } catch (error) {
      console.error('Error al obtener info del reporte:', error);
      Alert.alert('Error', 'Error al cargar información del reporte');
    } finally {
      setLoadingEliminarReporte(false);
    }
  };

  const eliminarReporte = async () => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar este reporte?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: async () => {
          setLoadingEliminarReporte(true);
          
          try {
            await reportesService.eliminarReporte(reporteInfo.id);
            Alert.alert('Éxito', 'Reporte eliminado exitosamente');
            
            setInfoReporteVisible(false);
            setReporteInfo(null);
            setConfirmandoEliminacion(false);
            
            const nuevosReportes = reportesDisponibles.filter(r => r.id !== reporteInfo.id);
            setReportesDisponibles(nuevosReportes);
            
            if (nuevosReportes.length > 0) {
              const siguienteIndex = reporteActualIndex < nuevosReportes.length ? reporteActualIndex : 0;
              setReporteActualIndex(siguienteIndex);
              
              setTimeout(() => {
                const siguienteReporte = nuevosReportes[siguienteIndex];
                if (siguienteReporte) {
                  setReporteInfo(siguienteReporte);
                  setInfoReporteVisible(true);
                }
              }, 500);
            }
            
            await cargar();
            
          } catch (error) {
            console.error('Error al eliminar reporte:', error);
            Alert.alert('Error', error.message || 'Error al eliminar el reporte');
          } finally {
            setLoadingEliminarReporte(false);
          }
        }}
      ]
    );
  };

  const navegarReportes = (direccion) => {
    let nuevoIndex = reporteActualIndex;
    
    if (direccion === 'siguiente') {
      nuevoIndex = (reporteActualIndex + 1) % reportesDisponibles.length;
    } else if (direccion === 'anterior') {
      nuevoIndex = reporteActualIndex === 0 ? reportesDisponibles.length - 1 : reporteActualIndex - 1;
    }
    
    setReporteActualIndex(nuevoIndex);
    const reporte = reportesDisponibles[nuevoIndex];
    
    if (reporte) {
      setReporteInfo(reporte);
      setInfoReporteVisible(true);
    }
  };

  const vaciarReportes = async (sugerenciaId) => {
    Alert.alert(
      'Confirmar eliminación masiva',
      '¿Estás seguro de que deseas eliminar TODOS los reportes de esta sugerencia?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar Todos', style: 'destructive', onPress: async () => {
          try {
            setLoadingVaciarReportes(true);
            await reportesService.vaciarReportesDeSugerencia(sugerenciaId);
            
            Alert.alert('Éxito', 'Todos los reportes de la sugerencia han sido eliminados');
            
            setInfoReporteVisible(false);
            setReporteInfo(null);
            
            const nuevosReportes = reportesDisponibles.filter(r => r.sugerencia?.id !== sugerenciaId);
            setReportesDisponibles(nuevosReportes);
            
            if (nuevosReportes.length > 0) {
              const siguienteIndex = reporteActualIndex < nuevosReportes.length ? reporteActualIndex : 0;
              setReporteActualIndex(siguienteIndex);
              
              setTimeout(() => {
                const siguienteReporte = nuevosReportes[siguienteIndex];
                if (siguienteReporte) {
                  setReporteInfo(siguienteReporte);
                  setInfoReporteVisible(true);
                }
              }, 500);
            }
            
            await cargar();
            
          } catch (error) {
            console.error('Error al vaciar reportes:', error);
            Alert.alert('Error', error.message || 'Error al vaciar reportes de la sugerencia');
          } finally {
            setLoadingVaciarReportes(false);
          }
        }}
      ]
    );
  };

  // FUNCIÓN PARA MOSTRAR REPORTES PENDIENTES - AGREGADA
  const mostrarReportesPendientes = () => {
    if (reportesDisponibles.length === 0) {
      Alert.alert('Información', 'No hay reportes pendientes');
      return;
    }

    const primerReporte = reportesDisponibles[0];
    setReporteActualIndex(0);
    setReporteInfo(primerReporte);
    setInfoReporteVisible(true);
  };

  // Funciones de modales existentes
  const abrirVerMensaje = (sugerencia) => {
    setMensajeActivo(sugerencia.mensaje);
    setMsgAutor(sugerencia.autor);
    setMsgFecha(sugerencia.createdAt);
    setMsgModalVisible(true);
  };

  const abrirVerRespuesta = (sugerencia) => {
    if (!tieneRespuesta(sugerencia)) {
      Alert.alert('Aviso', 'Esta sugerencia aún no tiene respuesta');
      return;
    }
    setViewRespuesta(sugerencia.respuestaAdmin);
    setViewFecha(sugerencia.fechaRespuesta);
    setViewAdmin(sugerencia.adminResponsable);
    setViewModalVisible(true);
  };

  const abrirResponder = (sugerencia) => {
    setSugerenciaSel(sugerencia);
    if (tieneRespuesta(sugerencia)) {
      setRespuestaTexto(sugerencia.respuestaAdmin);
      setEstadoRespuesta(sugerencia.estado);
    } else {
      setRespuestaTexto('');
      setEstadoRespuesta('resuelta');
    }
    setRespModalVisible(true);
  };

  const abrirReportar = (sugerencia) => {
    setSugerenciaAReportar(sugerencia);
    setMotivoReporte('');
    setReportModalVisible(true);
  };

  const enviarRespuesta = async () => {
    if (!respuestaTexto.trim()) {
      Alert.alert('Error', 'Debes escribir una respuesta');
      return;
    }

    try {
      setLoadingResp(true);
      await sugerenciasService.responderSugerencia(
        sugerenciaSel.id,
        respuestaTexto,
        estadoRespuesta
      );
      Alert.alert('Éxito', 'Respuesta enviada correctamente');
      setRespModalVisible(false);
      await cargar(currentPage, pageSize, {
        categoria: categoriaFiltro,
        estado: estadoFiltro,
        busqueda: searchText
      });
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo enviar la respuesta');
    } finally {
      setLoadingResp(false);
    }
  };

  const enviarReporte = async () => {
    if (!motivoReporte) {
      Alert.alert('Error', 'Debes seleccionar un motivo');
      return;
    }

    try {
      setLoadingReporte(true);
      await reportesService.crearReporte(sugerenciaAReportar.id, motivoReporte);
      setMisReportes(prev => [...prev, sugerenciaAReportar.id]);
      Alert.alert('Éxito', 'Reporte enviado correctamente');
      setReportModalVisible(false);
      await cargar(currentPage, pageSize, {
        categoria: categoriaFiltro,
        estado: estadoFiltro,
        busqueda: searchText
      });
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo enviar el reporte');
    } finally {
      setLoadingReporte(false);
    }
  };

  // Componente de paginación
  const renderPaginacion = () => {
    const totalPaginas = Math.ceil(totalRecords / pageSize);
    
    if (totalPaginas <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
          onPress={() => cambiarPagina(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Ionicons name="chevron-back" size={16} color={currentPage === 1 ? "#ccc" : "#1e3a8a"} />
          <Text style={[styles.paginationButtonText, currentPage === 1 && styles.paginationButtonTextDisabled]}>
            Anterior
          </Text>
        </TouchableOpacity>

        <Text style={styles.paginationInfo}>
          Página {currentPage} de {totalPaginas}
        </Text>

        <TouchableOpacity
          style={[styles.paginationButton, currentPage === totalPaginas && styles.paginationButtonDisabled]}
          onPress={() => cambiarPagina(currentPage + 1)}
          disabled={currentPage === totalPaginas}
        >
          <Text style={[styles.paginationButtonText, currentPage === totalPaginas && styles.paginationButtonTextDisabled]}>
            Siguiente
          </Text>
          <Ionicons name="chevron-forward" size={16} color={currentPage === totalPaginas ? "#ccc" : "#1e3a8a"} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderSugerencia = ({ item }) => (
    <View style={styles.sugerenciaCard}>
      {/* Header con título y estado */}
      <View style={styles.cardHeader}>
        <Text style={styles.titulo}>{item.titulo}</Text>
        <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(item.estado) }]}>
          <Text style={styles.estadoTexto}>{item.estado.toUpperCase()}</Text>
        </View>
      </View>

      {/* Categoría y fecha */}
      <View style={styles.cardInfo}>
        <Text style={styles.categoria}>{getCategoriaTexto(item.categoria)}</Text>
        <Text style={styles.fecha}>{formatearFecha(item.createdAt)}</Text>
      </View>

      {/* Botones de acción */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => abrirVerMensaje(item)}
        >
          <Ionicons name="chatbubble-outline" size={18} color="#1e3a8a" />
          <Text style={styles.actionText}>Ver Mensaje</Text>
        </TouchableOpacity>

        {esEstud && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, !tieneRespuesta(item) && styles.disabledButton]}
              onPress={() => abrirVerRespuesta(item)}
              disabled={!tieneRespuesta(item)}
            >
              <Ionicons 
                name="checkmark-circle-outline" 
                size={18} 
                color={tieneRespuesta(item) ? "#52c41a" : "#ccc"} 
              />
              <Text style={[styles.actionText, !tieneRespuesta(item) && styles.disabledText]}>
                Ver Respuesta
              </Text>
            </TouchableOpacity>

            {puedeReportar(item) ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.reportButton]}
                onPress={() => abrirReportar(item)}
              >
                <Ionicons name="warning-outline" size={18} color="#ff4d4f" />
                <Text style={[styles.actionText, styles.reportText]}>Reportar</Text>
              </TouchableOpacity>
            ) : misReportes.includes(item.id) && (
              <View style={[styles.actionButton, styles.disabledButton]}>
                <Ionicons name="warning" size={18} color="#ccc" />
                <Text style={[styles.actionText, styles.disabledText]}>Reportado</Text>
              </View>
            )}
          </>
        )}

        {esAdmin && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, !tieneRespuesta(item) && styles.disabledButton]}
              onPress={() => abrirVerRespuesta(item)}
              disabled={!tieneRespuesta(item)}
            >
              <Ionicons 
                name="eye-outline" 
                size={18} 
                color={tieneRespuesta(item) ? "#52c41a" : "#ccc"} 
              />
              <Text style={[styles.actionText, !tieneRespuesta(item) && styles.disabledText]}>
                Ver
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton, item.estado === 'archivada' && styles.disabledButton]}
              onPress={() => abrirResponder(item)}
              disabled={item.estado === 'archivada'}
            >
              <Ionicons name="create-outline" size={18} color="white" />
              <Text style={[styles.actionText, styles.primaryText]}>
                {tieneRespuesta(item) ? 'Editar' : 'Responder'}
              </Text>
            </TouchableOpacity>

            {item.isReportada && (
              <TouchableOpacity
                style={[styles.actionButton, styles.reportButton]}
                onPress={() => verInfoReporte(item)}
              >
                <Ionicons name="warning" size={18} color="#ff4d4f" />
                <Text style={[styles.actionText, styles.reportText]}>
                  ! ({reportesDisponibles.filter(r => r.sugerencia?.id === item.id).length})
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
         {esAdmin ? 'Administrar Sugerencias' : 'Lista de Sugerencias'}
        </Text>
        
        {/* Botón de reportes pendientes para admin */}
        {esAdmin && reportesDisponibles.length > 0 && (
          <TouchableOpacity
            style={styles.reportesButton}
            onPress={mostrarReportesPendientes}
          >
            <Ionicons name="warning" size={20} color="#ff4d4f" />
            <Text style={styles.reportesButtonText}>
              Reportes ({reportesDisponibles.length})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Búsqueda y filtros */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar sugerencias..."
            value={searchText}
            onChangeText={buscarSugerencias}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => buscarSugerencias('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFiltrosVisible(true)}
        >
          <Ionicons name="filter" size={20} color="#1e3a8a" />
          <Text style={styles.filterButtonText}>Filtros</Text>
          {(categoriaFiltro || estadoFiltro) && (
            <View style={styles.filterActiveBadge} />
          )}
        </TouchableOpacity>
      </View>

      {/* Lista de sugerencias */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={styles.loadingText}>Cargando sugerencias...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={sugerencias}
            renderItem={renderSugerencia}
            keyExtractor={(item) => item.id.toString()}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="document-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>No se encontraron sugerencias</Text>
                {(searchText || categoriaFiltro || estadoFiltro) && (
                  <TouchableOpacity onPress={limpiarFiltros} style={styles.clearFiltersButton}>
                    <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
          
          {/* Paginación */}
          {renderPaginacion()}
        </>
      )}

      {/* MODALES */}
      
      {/* Modal de filtros */}
      <Modal
        visible={filtrosVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFiltrosVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setFiltrosVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Categoría:</Text>
                <Picker
                  selectedValue={categoriaFiltro}
                  onValueChange={setCategoriaFiltro}
                  style={styles.picker}
                >
                  <Picker.Item label="Todas las categorías" value={null} />
                  <Picker.Item label="Eventos" value="eventos" />
                  <Picker.Item label="Infraestructura" value="infraestructura" />
                  <Picker.Item label="Bienestar" value="bienestar" />
                  <Picker.Item label="Otros" value="otros" />
                </Picker>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Estado:</Text>
                <Picker
                  selectedValue={estadoFiltro}
                  onValueChange={setEstadoFiltro}
                  style={styles.picker}
                >
                  <Picker.Item label="Todos los estados" value={null} />
                  <Picker.Item label="Pendiente" value="pendiente" />
                  <Picker.Item label="En proceso" value="en proceso" />
                  <Picker.Item label="Resuelta" value="resuelta" />
                  <Picker.Item label="Archivada" value="archivada" />
                </Picker>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={limpiarFiltros}
              >
                <Text style={styles.clearButtonText}>Limpiar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={aplicarFiltros}
              >
                <Text style={styles.applyButtonText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de ver mensaje */}
      <Modal
        visible={msgModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setMsgModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mensaje de la Sugerencia</Text>
              <TouchableOpacity onPress={() => setMsgModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.messageText}>{mensajeActivo}</Text>
              
              <View style={styles.messageInfo}>
                <Text style={styles.messageInfoLabel}>Autor:</Text>
                <Text style={styles.messageInfoText}>
                  {msgAutor?.nombre || 'Usuario anónimo'}
                </Text>
              </View>
              
              <View style={styles.messageInfo}>
                <Text style={styles.messageInfoLabel}>Fecha:</Text>
                <Text style={styles.messageInfoText}>
                  {formatearFecha(msgFecha)}
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setMsgModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de ver respuesta */}
      <Modal
        visible={viewModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setViewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Respuesta Administrativa</Text>
              <TouchableOpacity onPress={() => setViewModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.responseText}>{viewRespuesta}</Text>
              
              <View style={styles.responseInfo}>
                <Text style={styles.responseInfoLabel}>Respondido por:</Text>
                <Text style={styles.responseInfoText}>
                  {viewAdmin?.nombre || 'Administrador'}
                </Text>
              </View>
              
              <View style={styles.responseInfo}>
                <Text style={styles.responseInfoLabel}>Fecha de respuesta:</Text>
                <Text style={styles.responseInfoText}>
                  {formatearFecha(viewFecha)}
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setViewModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de responder/editar (solo admin) */}
      {esAdmin && (
        <Modal
          visible={respModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setRespModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {tieneRespuesta(sugerenciaSel) ? 'Editar Respuesta' : 'Responder Sugerencia'}
                </Text>
                <TouchableOpacity onPress={() => setRespModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>Estado de la sugerencia:</Text>
                  <Picker
                    selectedValue={estadoRespuesta}
                    onValueChange={setEstadoRespuesta}
                    style={styles.picker}
                  >
                    <Picker.Item label="En proceso" value="en proceso" />
                    <Picker.Item label="Resuelta" value="resuelta" />
                    <Picker.Item label="Archivada" value="archivada" />
                  </Picker>
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>Respuesta:</Text>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Escribe tu respuesta aquí..."
                    value={respuestaTexto}
                    onChangeText={setRespuestaTexto}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                  />
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setRespModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitButton, loadingResp && styles.disabledButton]}
                  onPress={enviarRespuesta}
                  disabled={loadingResp}
                >
                  {loadingResp ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {tieneRespuesta(sugerenciaSel) ? 'Actualizar' : 'Enviar'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Modal de reportar (solo estudiantes) */}
      {esEstud && (
        <Modal
          visible={reportModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setReportModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Reportar Sugerencia</Text>
                <TouchableOpacity onPress={() => setReportModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                <Text style={styles.reportWarning}>
                  ¿Por qué deseas reportar esta sugerencia?
                </Text>

                <View style={styles.reportOptions}>
                  {[
                    { value: 'contenido_inapropiado', label: 'Contenido inapropiado' },
                    { value: 'spam', label: 'Spam o contenido repetitivo' },
                    { value: 'informacion_falsa', label: 'Información falsa' },
                    { value: 'lenguaje_ofensivo', label: 'Lenguaje ofensivo' },
                    { value: 'otro', label: 'Otro motivo' }
                  ].map((opcion) => (
                    <TouchableOpacity
                      key={opcion.value}
                      style={[
                        styles.reportOption,
                        motivoReporte === opcion.value && styles.reportOptionSelected
                      ]}
                      onPress={() => setMotivoReporte(opcion.value)}
                    >
                      <Ionicons
                        name={motivoReporte === opcion.value ? "radio-button-on" : "radio-button-off"}
                        size={20}
                        color={motivoReporte === opcion.value ? "#1e3a8a" : "#666"}
                      />
                      <Text style={[
                        styles.reportOptionText,
                        motivoReporte === opcion.value && styles.reportOptionTextSelected
                      ]}>
                        {opcion.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setReportModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.reportSubmitButton, loadingReporte && styles.disabledButton]}
                  onPress={enviarReporte}
                  disabled={loadingReporte || !motivoReporte}
                >
                  {loadingReporte ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.reportSubmitButtonText}>Enviar Reporte</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Modal de información de reporte (solo admin) */}
      {esAdmin && (
        <Modal
          visible={infoReporteVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setInfoReporteVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Información del Reporte</Text>
                <View style={styles.modalHeaderActions}>
                  {reportesDisponibles.length > 1 && (
                    <View style={styles.navigationButtons}>
                      <TouchableOpacity
                        style={styles.navButton}
                        onPress={() => navegarReportes('anterior')}
                      >
                        <Ionicons name="chevron-back" size={20} color="#1e3a8a" />
                      </TouchableOpacity>
                      <Text style={styles.reportCounter}>
                        {reporteActualIndex + 1} de {reportesDisponibles.length}
                      </Text>
                      <TouchableOpacity
                        style={styles.navButton}
                        onPress={() => navegarReportes('siguiente')}
                      >
                        <Ionicons name="chevron-forward" size={20} color="#1e3a8a" />
                      </TouchableOpacity>
                    </View>
                  )}
                  <TouchableOpacity onPress={() => setInfoReporteVisible(false)}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView style={styles.modalContent}>
                {reporteInfo && (
                  <>
                    <View style={styles.reportSection}>
                      <Text style={styles.reportSectionTitle}>Detalles del Reporte</Text>
                      <View style={styles.reportDetail}>
                        <Text style={styles.reportDetailLabel}>Motivo:</Text>
                        <Text style={styles.reportDetailText}>{reporteInfo.motivo}</Text>
                      </View>
                      <View style={styles.reportDetail}>
                        <Text style={styles.reportDetailLabel}>Reportado por:</Text>
                        <Text style={styles.reportDetailText}>
                          {reporteInfo.usuario?.nombre || 'Usuario anónimo'}
                          {reporteInfo.usuario?.isMuted && (
                            <Text style={styles.mutedIndicator}> (Muteado)</Text>
                          )}
                        </Text>
                      </View>
                      <View style={styles.reportDetail}>
                        <Text style={styles.reportDetailLabel}>Fecha:</Text>
                        <Text style={styles.reportDetailText}>
                          {formatearFecha(reporteInfo.createdAt)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.reportSection}>
                      <Text style={styles.reportSectionTitle}>Sugerencia Reportada</Text>
                      <View style={styles.reportDetail}>
                        <Text style={styles.reportDetailLabel}>Título:</Text>
                        <Text style={styles.reportDetailText}>
                          {reporteInfo.sugerencia?.titulo}
                        </Text>
                      </View>
                      <View style={styles.reportDetail}>
                        <Text style={styles.reportDetailLabel}>Autor:</Text>
                        <Text style={styles.reportDetailText}>
                          {reporteInfo.sugerencia?.autor?.nombre || 'Usuario anónimo'}
                          {reporteInfo.sugerencia?.autor?.isMuted && (
                            <Text style={styles.mutedIndicator}> (Muteado)</Text>
                          )}
                        </Text>
                      </View>
                      <View style={styles.reportDetail}>
                        <Text style={styles.reportDetailLabel}>Estado:</Text>
                        <Text style={styles.reportDetailText}>
                          {reporteInfo.sugerencia?.estado}
                        </Text>
                      </View>
                    </View>

                    {/* Acciones de muteo */}
                    <View style={styles.reportSection}>
                      <Text style={styles.reportSectionTitle}>Acciones de Moderación</Text>
                      
                      {/* Mutear reportador */}
                      <View style={styles.muteoActions}>
                        <Text style={styles.muteoSubtitle}>Usuario que reportó:</Text>
                         <Text>{reporteInfo.usuario?.nombre} {reporteInfo.usuario?.apellido}</Text>
                        {reporteInfo.usuario?.isMuted ? (
                          <TouchableOpacity
                            style={[styles.actionButton, styles.desmuteoButton, loadingDesmuteo && styles.disabledButton]}
                            onPress={() => desmutearUsuario(reporteInfo.usuario.id, reporteInfo.usuario.nombre)}
                            disabled={loadingDesmuteo}
                          >
                            {loadingDesmuteo ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              <>
                                <Ionicons name="volume-high" size={16} color="#fff" />
                                <Text style={styles.actionButtonText}>Desmutear</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            style={[styles.actionButton, styles.muteoButton]}
                            onPress={() => abrirMuteoModal(reporteInfo.usuario, 'reportador')}
                          >
                            <Ionicons name="volume-mute" size={16} color="#fff" />
                            <Text style={styles.actionButtonText}>Mutear Reportador</Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* Mutear autor */}
                      <View style={styles.muteoActions}>
                        <Text style={styles.muteoSubtitle}>Autor de la sugerencia:</Text>
                        <Text>{reporteInfo.sugerencia?.autor?.nombre} {reporteInfo.sugerencia?.autor?.apellido}</Text>
                        {reporteInfo.sugerencia?.autor?.isMuted ? (
                          <TouchableOpacity
                            style={[styles.actionButton, styles.desmuteoButton, loadingDesmuteo && styles.disabledButton]}
                            onPress={() => desmutearUsuario(reporteInfo.sugerencia.autor.id, reporteInfo.sugerencia.autor.nombre)}
                            disabled={loadingDesmuteo}
                          >
                            {loadingDesmuteo ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              <>
                                <Ionicons name="volume-high" size={16} color="#fff" />
                                <Text style={styles.actionButtonText}>Desmutear</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            style={[styles.actionButton, styles.muteoButton]}
                            onPress={() => abrirMuteoModal(reporteInfo.sugerencia?.autor, 'autor')}
                          >
                            <Ionicons name="volume-mute" size={16} color="#fff" />
                            <Text style={styles.actionButtonText}>Mutear Autor</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </>
                )}
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.deleteReportButton, loadingVaciarReportes && styles.disabledButton]}
                  onPress={() => vaciarReportes(reporteInfo?.sugerencia?.id)}
                  disabled={loadingVaciarReportes}
                >
                  {loadingVaciarReportes ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.deleteReportButtonText}>Eliminar Todos los Reportes</Text>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.deleteButton, loadingEliminarReporte && styles.disabledButton]}
                  onPress={eliminarReporte}
                  disabled={loadingEliminarReporte}
                >
                  {loadingEliminarReporte ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.deleteButtonText}>Eliminar Reporte</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Modal de mutear usuario (solo admin) */}
      {esAdmin && (
        <Modal
          visible={muteoModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setMuteoModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Mutear Usuario: {usuarioAMutear?.nombre}
                </Text>
                <TouchableOpacity onPress={() => setMuteoModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>Razón del muteo:</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Especifica la razón del muteo..."
                    value={razonMuteo}
                    onChangeText={setRazonMuteo}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>Fecha de fin del muteo:</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="YYYY-MM-DD HH:MM"
                    value={fechaFinMuteo}
                    onChangeText={setFechaFinMuteo}
                  />
                  <Text style={styles.inputHint}>
                    Formato: 2024-12-31 23:59
                  </Text>
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setMuteoModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.muteoConfirmButton, loadingMuteo && styles.disabledButton]}
                  onPress={mutearUsuario}
                  disabled={loadingMuteo}
                >
                  {loadingMuteo ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.muteoConfirmButtonText}>Mutear Usuario</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40,
    backgroundColor: '#1e3a8a',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  reportesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 5,
  },
  reportesButtonText: {
    color: '#ff4d4f',
    fontWeight: '600',
    fontSize: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    gap: 5,
    position: 'relative',
  },
  filterButtonText: {
    color: '#1e3a8a',
    fontWeight: '600',
  },
  filterActiveBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    backgroundColor: '#ff4d4f',
    borderRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
    fontSize: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  clearFiltersButton: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearFiltersText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
  },
  sugerenciaCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoTexto: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  cardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoria: {
    fontSize: 14,
    color: '#1e3a8a',
    fontWeight: '500',
  },
  fecha: {
    fontSize: 12,
    color: '#666',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cardActionsLeft: {
    flexDirection: 'row',
    gap: 8,
  },
  cardActionsRight: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
    color: '#1e3a8a',
  },
  primaryButton: {
    backgroundColor: '#1e3a8a',
    borderColor: '#1e3a8a',
  },
  primaryText: {
    color: 'white',
  },
  reportButton: {
    backgroundColor: '#fff1f0',
    borderColor: '#ffccc7',
  },
  reportText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
    color: '#ff4d4f',
  },
  disabledButton: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  disabledText: {
    color: '#ccc',
  },
  // Paginación
  paginacionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  paginacionInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  paginacionBotones: {
    flexDirection: 'row',
    gap: 8,
  },
  paginacionBoton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  paginacionBotonDeshabilitado: {
    backgroundColor: '#f5f5f5',
  },
  paginacionTexto: {
    marginHorizontal: 4,
    fontSize: 14,
    fontWeight: '500',
    color: '#1e3a8a',
  },
  paginacionTextoDeshabilitado: {
    color: '#ccc',
  },
  // Modales
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navigationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  reportCounter: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  modalContent: {
    padding: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  // Modal de filtros
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 16,
  },
  picker: {
    height: 50,
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  clearButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  applyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#1e3a8a',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  // Modal de mensaje
  messageBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1a1a1a',
  },
  messageInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  messageInfoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    width: 80,
  },
  messageInfoText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  metaInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  // Modal de respuesta
  responseText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1a1a1a',
    marginBottom: 16,
  },
  responseInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  responseInfoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    width: 120,
  },
  responseInfoText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  // Modal de responder/editar
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    minHeight: 100,
    backgroundColor: 'white',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  inputHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#1e3a8a',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#1e3a8a',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  // Modal de reportar
  reportWarning: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
    textAlign: 'center',
  },
  reportOptions: {
    gap: 12,
  },
  reportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 8,
  },
  reportOptionSelected: {
    backgroundColor: '#e6f3ff',
    borderColor: '#1e3a8a',
  },
  reportOptionText: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  reportOptionTextSelected: {
    color: '#1e3a8a',
    fontWeight: '500',
  },
  reportSubmitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#ff4d4f',
  },
  reportSubmitButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  dangerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#ff4d4f',
  },
  dangerButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  // Modal de información de reporte
  reportSection: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  reportSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  reportDetail: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reportDetailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    width: 100,
  },
  reportDetailText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  mutedIndicator: {
    color: '#ff4d4f',
    fontWeight: '600',
    fontSize: 12,
  },
  // Acciones de muteo
  muteoActions: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  muteoSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  muteoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#ff9500',
  },
  desmuteoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#52c41a',
  },
  muteoConfirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#ff9500',
  },
  muteoConfirmButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  deleteReportButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#722ed1',
  },
  deleteReportButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#ff4d4f',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default ListaSugerencias;