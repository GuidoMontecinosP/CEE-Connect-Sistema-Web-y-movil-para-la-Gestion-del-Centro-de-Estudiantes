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
      {/* Botón Anterior */}
      <TouchableOpacity
        style={[
          styles.paginationButton, 
          currentPage === 1 && styles.paginationButtonDisabled
        ]}
        onPress={() => cambiarPagina(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <Ionicons 
          name="chevron-back" 
          size={18} 
          color={currentPage === 1 ? "#ccc" : "#1e3a8a"} 
        />
      </TouchableOpacity>

      {/* Números de página */}
      <View style={styles.pageNumbersContainer}>
        {currentPage > 2 && (
          <>
            <TouchableOpacity
              style={styles.pageNumber}
              onPress={() => cambiarPagina(1)}
            >
              <Text style={styles.pageNumberText}>1</Text>
            </TouchableOpacity>
            {currentPage > 3 && (
              <Text style={styles.ellipsis}>...</Text>
            )}
          </>
        )}

        {currentPage > 1 && (
          <TouchableOpacity
            style={styles.pageNumber}
            onPress={() => cambiarPagina(currentPage - 1)}
          >
            <Text style={styles.pageNumberText}>{currentPage - 1}</Text>
          </TouchableOpacity>
        )}

        <View style={[styles.pageNumber, styles.currentPageNumber]}>
          <Text style={styles.currentPageText}>{currentPage}</Text>
        </View>

        {currentPage < totalPaginas && (
          <TouchableOpacity
            style={styles.pageNumber}
            onPress={() => cambiarPagina(currentPage + 1)}
          >
            <Text style={styles.pageNumberText}>{currentPage + 1}</Text>
          </TouchableOpacity>
        )}

        {currentPage < totalPaginas - 1 && (
          <>
            {currentPage < totalPaginas - 2 && (
              <Text style={styles.ellipsis}>...</Text>
            )}
            <TouchableOpacity
              style={styles.pageNumber}
              onPress={() => cambiarPagina(totalPaginas)}
            >
              <Text style={styles.pageNumberText}>{totalPaginas}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Botón Siguiente */}
      <TouchableOpacity
        style={[
          styles.paginationButton, 
          currentPage === totalPaginas && styles.paginationButtonDisabled
        ]}
        onPress={() => cambiarPagina(currentPage + 1)}
        disabled={currentPage === totalPaginas}
      >
        <Ionicons 
          name="chevron-forward" 
          size={18} 
          color={currentPage === totalPaginas ? "#ccc" : "#1e3a8a"} 
        />
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
      {esEstud && (
  <TouchableOpacity
    style={styles.mySuggestionsButton}
    onPress={() => navigation.navigate('MisSugerencias')}
  >
    <Ionicons name="person-outline" size={20} color="#1e3a8a" />
    <Text style={styles.mySuggestionsButtonText}>Mis Sugerencias</Text>
    <Ionicons name="chevron-forward" size={16} color="#1e3a8a" />
  </TouchableOpacity>
)}

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
    <View style={styles.filterModalContainer}>
      {/* Header mejorado */}
      <View style={styles.filterModalHeader}>
        <View style={styles.filterHeaderLeft}>
          <View style={styles.filterIconContainer}>
            <Ionicons name="options-outline" size={24} color="#1e3a8a" />
          </View>
          <Text style={styles.filterModalTitle}>Filtrar Resultados</Text>
        </View>
        <TouchableOpacity 
          style={styles.closeIconButton}
          onPress={() => setFiltrosVisible(false)}
        >
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.filterModalContent} showsVerticalScrollIndicator={false}>
        {/* Categoría */}
        <View style={styles.filterCard}>
          <View style={styles.filterCardHeader}>
            <Ionicons name="file-tray-stacked-outline" size={20} color="#1e3a8a" />
            <Text style={styles.filterCardTitle}>Categoría</Text>
          </View>
          <View style={styles.optionsGrid}>
            {[
              { label: 'Todas', value: null, icon: 'apps-outline' },
              { label: 'Eventos', value: 'eventos', icon: 'calendar-outline' },
              { label: 'Infraestructura', value: 'infraestructura', icon: 'construct-outline' },
              { label: 'Bienestar', value: 'bienestar', icon: 'heart-outline' },
              { label: 'Otros', value: 'otros', icon: 'ellipsis-horizontal-outline' }
            ].map((option) => (
              <TouchableOpacity
                key={option.value || 'all'}
                style={[
                  styles.filterOption,
                  categoriaFiltro === option.value && styles.filterOptionSelected
                ]}
                onPress={() => setCategoriaFiltro(option.value)}
              >
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={categoriaFiltro === option.value ? '#fff' : '#1e3a8a'}
                />
                <Text style={[
                  styles.filterOptionText,
                  categoriaFiltro === option.value && styles.filterOptionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Estado */}
        <View style={styles.filterCard}>
          <View style={styles.filterCardHeader}>
            <Ionicons name="flag-outline" size={20} color="#1e3a8a" />
            <Text style={styles.filterCardTitle}>Estado</Text>
          </View>
          <View style={styles.optionsGrid}>
            {[
              { label: 'Todos', value: null, icon: 'checkmark-circle-outline', color: '#666' },
              { label: 'Pendiente', value: 'pendiente', icon: 'time-outline', color: '#ff9500' },
              { label: 'En proceso', value: 'en proceso', icon: 'sync-outline', color: '#1890ff' },
              { label: 'Resuelta', value: 'resuelta', icon: 'checkmark-done-outline', color: '#52c41a' },
              { label: 'Archivada', value: 'archivada', icon: 'archive-outline', color: '#8c8c8c' }
            ].map((option) => (
              <TouchableOpacity
                key={option.value || 'all'}
                style={[
                  styles.filterOption,
                  estadoFiltro === option.value && styles.filterOptionSelected,
                  estadoFiltro === option.value && { backgroundColor: option.color }
                ]}
                onPress={() => setEstadoFiltro(option.value)}
              >
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={estadoFiltro === option.value ? '#fff' : option.color}
                />
                <Text style={[
                  styles.filterOptionText,
                  estadoFiltro === option.value && styles.filterOptionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Indicador de filtros activos */}
        {(categoriaFiltro || estadoFiltro) && (
          <View style={styles.activeFiltersCard}>
            <View style={styles.activeFiltersHeader}>
              <Ionicons name="funnel-outline" size={16} color="#1e3a8a" />
              <Text style={styles.activeFiltersTitle}>Filtros Activos</Text>
            </View>
            <View style={styles.activeFiltersList}>
              {categoriaFiltro && (
                <View style={styles.activeFilterTag}>
                  <Text style={styles.activeFilterText}>
                    Categoría: {categoriaFiltro === 'eventos' ? 'Eventos' : 
                               categoriaFiltro === 'infraestructura' ? 'Infraestructura' :
                               categoriaFiltro === 'bienestar' ? 'Bienestar' : 'Otros'}
                  </Text>
                  <TouchableOpacity onPress={() => setCategoriaFiltro(null)}>
                    <Ionicons name="close-circle" size={16} color="#1e3a8a" />
                  </TouchableOpacity>
                </View>
              )}
              {estadoFiltro && (
                <View style={styles.activeFilterTag}>
                  <Text style={styles.activeFilterText}>
                    Estado: {estadoFiltro === 'pendiente' ? 'Pendiente' :
                            estadoFiltro === 'en proceso' ? 'En proceso' :
                            estadoFiltro === 'resuelta' ? 'Resuelta' : 'Archivada'}
                  </Text>
                  <TouchableOpacity onPress={() => setEstadoFiltro(null)}>
                    <Ionicons name="close-circle" size={16} color="#1e3a8a" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer con botones mejorados */}
      <View style={styles.filterModalFooter}>
        <TouchableOpacity
          style={styles.clearFiltersButton}
          onPress={limpiarFiltros}
        >
          <Ionicons name="refresh-outline" size={18} color="#ff4d4f" />
          <Text style={styles.clearFiltersButtonText}>Limpiar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.applyFiltersButton}
          onPress={aplicarFiltros}
        >
          <Ionicons name="checkmark-outline" size={18} color="#fff" />
          <Text style={styles.applyFiltersButtonText}>Aplicar Filtros</Text>
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
    {msgAutor
      ? `${msgAutor.nombre}${msgAutor.apellido ? ' ' + msgAutor.apellido : ''}`
      : 'Usuario anónimo'}
  </Text>
               </View>
               <View style={styles.messageInfo}>
  <Text style={styles.messageInfoLabel}>Contacto:</Text>
  <Text style={styles.messageInfoText}>
    {msgAutor?.contacto || 'Sin contacto'}
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
                    maxLength={500}  
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

      {esEstud && (
  <TouchableOpacity
    style={styles.floatingActionButton}
    onPress={() => navigation.navigate('CrearSugerencia')}
  >
    <Ionicons name="add" size={24} color="#fff" />
  </TouchableOpacity>
)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  floatingActionButton: {
  position: 'absolute',
  bottom: 20,
  right: 20,
  backgroundColor: '#1e3a8a',
  width: 56,
  height: 56,
  borderRadius: 28,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 8,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  zIndex: 1000,
}
,
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
  filterModalContainer: {
  backgroundColor: 'white',
  borderRadius: 20,
  width: '92%',
  maxHeight: '85%',
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 10,
  },
  shadowOpacity: 0.25,
  shadowRadius: 15,
  elevation: 10,
},
filterModalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingVertical: 16,
  borderBottomWidth: 1,
  borderBottomColor: '#f0f0f0',
  backgroundColor: '#fafafa',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
},
filterHeaderLeft: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
},
filterIconContainer: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: '#e6f3ff',
  justifyContent: 'center',
  alignItems: 'center',
},
filterModalTitle: {
  fontSize: 18,
  fontWeight: '600',
  color: '#1a1a1a',
},
closeIconButton: {
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: '#f0f0f0',
  justifyContent: 'center',
  alignItems: 'center',
},
filterModalContent: {
  padding: 20,
},
filterCard: {
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 16,
  marginBottom: 16,
  borderWidth: 1,
  borderColor: '#f0f0f0',
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2,
},
filterCardHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  marginBottom: 12,
},
filterCardTitle: {
  fontSize: 16,
  fontWeight: '600',
  color: '#1a1a1a',
},
optionsGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
},
filterOption: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 20,
  backgroundColor: '#f8f9fa',
  borderWidth: 1,
  borderColor: '#e0e0e0',
  gap: 6,
  minWidth: 80,
},
filterOptionSelected: {
  backgroundColor: '#1e3a8a',
  borderColor: '#1e3a8a',
  transform: [{ scale: 1.05 }],
  shadowColor: '#1e3a8a',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 4,
},
filterOptionText: {
  fontSize: 13,
  fontWeight: '500',
  color: '#1a1a1a',
},
filterOptionTextSelected: {
  color: '#fff',
  fontWeight: '600',
},
activeFiltersCard: {
  backgroundColor: '#e6f3ff',
  borderRadius: 12,
  padding: 16,
  borderWidth: 1,
  borderColor: '#b3d9ff',
  marginTop: 8,
},
activeFiltersHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  marginBottom: 10,
},
activeFiltersTitle: {
  fontSize: 14,
  fontWeight: '600',
  color: '#1e3a8a',
},
activeFiltersList: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
},
activeFilterTag: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fff',
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 16,
  gap: 6,
  borderWidth: 1,
  borderColor: '#1e3a8a',
},
activeFilterText: {
  fontSize: 12,
  color: '#1e3a8a',
  fontWeight: '500',
},
filterModalFooter: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingHorizontal: 20,
  paddingVertical: 16,
  borderTopWidth: 1,
  borderTopColor: '#f0f0f0',
  backgroundColor: '#fafafa',
  borderBottomLeftRadius: 20,
  borderBottomRightRadius: 20,
  gap: 12,
},
clearFiltersButton: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 12,
  borderRadius: 10,
  backgroundColor: '#fff',
  borderWidth: 1,
  borderColor: '#ff4d4f',
  gap: 6,
},
clearFiltersButtonText: {
  color: '#ff4d4f',
  fontWeight: '600',
  fontSize: 14,
},
applyFiltersButton: {
  flex: 2,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 12,
  borderRadius: 10,
  backgroundColor: '#1e3a8a',
  gap: 6,
  shadowColor: '#1e3a8a',
  shadowOffset: {
    width: 0,
    height: 3,
  },
  shadowOpacity: 0.3,
  shadowRadius: 5,
  elevation: 5,
},
applyFiltersButtonText: {
  color: '#fff',
  fontWeight: '600',
  fontSize: 14,
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
  paginationContainer: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingVertical: 16,
  backgroundColor: 'white',
  borderTopWidth: 1,
  borderTopColor: '#e0e0e0',
  gap: 8,
},
paginationButton: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: '#f8f9fa',
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#e0e0e0',
},
paginationButtonDisabled: {
  backgroundColor: '#f5f5f5',
  borderColor: '#f0f0f0',
},
pageNumbersContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
},
pageNumber: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: '#f8f9fa',
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#e0e0e0',
},
currentPageNumber: {
  backgroundColor: '#1e3a8a',
  borderColor: '#1e3a8a',
  shadowColor: '#1e3a8a',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.2,
  shadowRadius: 3,
  elevation: 3,
},
pageNumberText: {
  fontSize: 14,
  fontWeight: '500',
  color: '#1e3a8a',
},
currentPageText: {
  fontSize: 14,
  fontWeight: '600',
  color: 'white',
},
ellipsis: {
  fontSize: 16,
  color: '#ccc',
  fontWeight: '500',
  marginHorizontal: 4,
},
mySuggestionsButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fff',       // o el color que prefieras
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 8,
  marginLeft: 8,
},
mySuggestionsButtonText: {
  marginLeft: 4,
  color: '#1e3a8a',             // asegúrate contraste con el fondo
  fontWeight: '600',
},
});



export default ListaSugerencias;