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

  // Estados para reportes y muteos
  const [misReportes, setMisReportes] = useState([]);
  const [reportesDisponibles, setReportesDisponibles] = useState([]);

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

  const [filtrosVisible, setFiltrosVisible] = useState(false);

  const { userToken, usuario } = useContext(AuthContext);
  const esAdmin = usuario?.rol?.nombre === 'administrador';
  const esEstud = usuario?.rol?.nombre === 'estudiante';

  // Función para cargar sugerencias - CORREGIDA
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

      //console.log('Filtros finales:', parametrosFiltro);

      const res = await sugerenciasService.obtenerSugerencias(page, limit, parametrosFiltro);
      const data = res.data || res;
     //  console.log('Datos obtenidos:', data.data[1]);
      
      //console.log('Respuesta del servidor:', data);

      setSugerencias(data.data || []);
      setTotalRecords(data.pagination?.total || 0);
      setCurrentPage(page);
      setPageSize(limit);

      // Cargar reportes del usuario si es estudiante
      if (esEstud) {
        try {
          const reportesRes = await reportesService.obtenerMisReportes();
          setMisReportes(reportesRes.data || []);
          console.log('Mis reportes (IDs):', reportesRes.data);
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
      //  console.log('Error al cargar sugerencias:', err.message);
      //console.error('Error al cargar sugerencias:', err);
      Alert.alert('Error', err.message || 'No se pudieron cargar las sugerencias');
      setSugerencias([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [categoriaFiltro, estadoFiltro, searchText, esAdmin, esEstud]);

  // Función de refresh - CORREGIDA
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

  // Función de búsqueda - CORREGIDA
 const buscarSugerencias = useCallback((valor) => {
  setSearchText(valor);
  
  // Limpiar timeout anterior
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  // Crear nuevo timeout
  const nuevoTimeout = setTimeout(() => {
    console.log('Ejecutando búsqueda con valor:', valor);
    setCurrentPage(1);
    cargar(1, pageSize, {
      categoria: categoriaFiltro,
      estado: estadoFiltro,
      busqueda: valor
    });
  }, 500);
  
  setSearchTimeout(nuevoTimeout);
}, [pageSize, categoriaFiltro, estadoFiltro, searchTimeout, cargar]);

  // Cambio de página - NUEVO
  const cambiarPagina = useCallback((nuevaPagina) => {
    if (nuevaPagina < 1 || nuevaPagina > Math.ceil(totalRecords / pageSize)) return;
    
    console.log('Cambiando a página:', nuevaPagina);
    setCurrentPage(nuevaPagina);
    cargar(nuevaPagina, pageSize, {
      categoria: categoriaFiltro,
      estado: estadoFiltro,
      busqueda: searchText
    });
  }, [totalRecords, pageSize, categoriaFiltro, estadoFiltro, searchText, cargar]);

  // Aplicar filtros - CORREGIDA
  const aplicarFiltros = useCallback(() => {
    //console.log('Aplicando filtros:', { categoriaFiltro, estadoFiltro });
    setCurrentPage(1);
    cargar(1, pageSize, {
      categoria: categoriaFiltro,
      estado: estadoFiltro,
      busqueda: searchText
    });
    setFiltrosVisible(false);
  }, [categoriaFiltro, estadoFiltro, searchText, pageSize, cargar]);

  // Limpiar filtros - NUEVA
  const limpiarFiltros = useCallback(() => {
   // console.log('Limpiando filtros');
    setCategoriaFiltro(null);
    setEstadoFiltro(null);
    setSearchText('');
    setCurrentPage(1);
    setFiltrosVisible(false);
    
    // Cargar sin filtros
    cargar(1, pageSize, {});
  }, [pageSize, cargar]);

  // Effect para carga inicial - CORREGIDO
  useEffect(() => {
   // console.log('Carga inicial del componente');
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

  // Funciones de modales
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
  

  // Componente de paginación - NUEVO
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
                onPress={() => console.log('Ver reporte')} // Implementar función
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
          {esAdmin ? 'Sugerencias Recibidas' : 'Sugerencias'}
        </Text>

        {/* Botón nueva sugerencia (solo estudiantes) */}
        {!esAdmin && (
          <TouchableOpacity
            style={styles.newButton}
            onPress={() => navigation.navigate('CrearSugerencia')}
          >
            <Ionicons name="add" size={24} color="white" />
            <Text style={styles.newButtonText}>Nueva</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Indicador de reportes pendientes (solo admin) */}
      {esAdmin && reportesDisponibles.length > 0 && (
        <View style={styles.reportsAlert}>
          <View style={styles.alertContent}>
            <Ionicons name="warning" size={20} color="#ff4d4f" />
            <Text style={styles.alertText}>
              Hay {reportesDisponibles.length} reportes pendientes
            </Text>
          </View>
          <TouchableOpacity style={styles.alertButton}>
            <Text style={styles.alertButtonText}>Revisar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar sugerencias..."
            value={searchText}
            onChangeText={buscarSugerencias}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFiltrosVisible(true)}
        >
          <Ionicons name="filter" size={20} color="#1e3a8a" />
        </TouchableOpacity>
      </View>

      {/* Lista de sugerencias */}
      {loading ? (
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
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="document-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>No hay sugerencias</Text>
              </View>
            }
          />
          
          {/* Paginación */}
          {renderPaginacion()}
        </>
      )}

      {/* Modal para ver mensaje */}
      <Modal
        visible={msgModalVisible}
        animationType="slide"
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
              <View style={styles.messageBox}>
                <Text style={styles.messageText}>{mensajeActivo}</Text>
              </View>
              
              {msgFecha && (
                <Text style={styles.metaInfo}>
                  Fecha: {formatearFecha(msgFecha)}
                </Text>
              )}
              
              {msgAutor && (
                <View>
                  <Text style={styles.metaInfo}>
                    Autor: {msgAutor.nombre} {msgAutor.apellido}
                  </Text>
                  <Text style={styles.metaInfo}>
                    Correo: {msgAutor.correo}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal para ver respuesta admin */}
      <Modal
        visible={viewModalVisible}
        animationType="slide"
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
              <View style={styles.messageBox}>
                <Text style={styles.messageText}>{viewRespuesta}</Text>
              </View>
              
              {viewFecha && (
                <Text style={styles.metaInfo}>
                  Fecha: {formatearFecha(viewFecha)}
                </Text>
              )}
              
              {viewAdmin && (
                <Text style={styles.metaInfo}>
                  Respondido por: {viewAdmin.nombre} {viewAdmin.apellido}
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal para reportar */}
      <Modal
        visible={reportModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Reportar: "{sugerenciaAReportar?.titulo || ''}"
              </Text>
              <TouchableOpacity onPress={() => setReportModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalDescription}>
                Selecciona el motivo por el cual deseas reportar esta sugerencia:
              </Text>
              
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={motivoReporte}
                  onValueChange={(itemValue) => setMotivoReporte(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Selecciona un motivo" value="" />
                  <Picker.Item label="Contenido inapropiado" value="contenido_inapropiado" />
                  <Picker.Item label="Spam" value="spam" />
                  <Picker.Item label="Lenguaje ofensivo" value="lenguaje_ofensivo" />
                  <Picker.Item label="Información falsa" value="informacion_falsa" />
                  <Picker.Item label="Duplicado" value="duplicado" />
                  <Picker.Item label="Otro" value="otro" />
                </Picker>
              </View>
              
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setReportModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.dangerButton}
                  onPress={enviarReporte}
                  disabled={loadingReporte || !motivoReporte}
                >
                  {loadingReporte ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.dangerButtonText}>Enviar Reporte</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal para responder/editar (Admin) */}
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
              <Text style={styles.inputLabel}>Respuesta</Text>
              <TextInput
                style={styles.textArea}
                value={respuestaTexto}
                onChangeText={setRespuestaTexto}
                placeholder="Escribe tu respuesta aquí..."
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              
              <Text style={styles.inputLabel}>Estado</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={estadoRespuesta}
                  onValueChange={(itemValue) => setEstadoRespuesta(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Pendiente" value="pendiente" />
                  <Picker.Item label="En proceso" value="en proceso" />
                  <Picker.Item label="Resuelta" value="resuelta" />
                  <Picker.Item label="Archivada" value="archivada" />
                </Picker>
              </View>
<View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setRespModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={enviarRespuesta}
                  disabled={loadingResp}
                >
                  {loadingResp ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      {tieneRespuesta(sugerenciaSel) ? 'Actualizar' : 'Enviar'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
              <Text style={styles.inputLabel}>Categoría</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={categoriaFiltro}
                  onValueChange={(itemValue) => setCategoriaFiltro(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Todas las categorías" value={null} />
                  <Picker.Item label="Eventos" value="eventos" />
                  <Picker.Item label="Infraestructura" value="infraestructura" />
                  <Picker.Item label="Bienestar" value="bienestar" />
                  <Picker.Item label="Otros" value="otros" />
                </Picker>
              </View>
              
              <Text style={styles.inputLabel}>Estado</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={estadoFiltro}
                  onValueChange={(itemValue) => setEstadoFiltro(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Todos los estados" value={null} />
                  <Picker.Item label="Pendiente" value="pendiente" />
                  <Picker.Item label="En proceso" value="en proceso" />
                  <Picker.Item label="Resuelta" value="resuelta" />
                  <Picker.Item label="Archivada" value="archivada" />
                </Picker>
              </View>
              
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={limpiarFiltros}
                >
                  <Text style={styles.cancelButtonText}>Limpiar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={aplicarFiltros}
                >
                  <Text style={styles.primaryButtonText}>Aplicar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
  },
  reportsAlert: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff2e8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ffe7ba',
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alertText: {
    marginLeft: 8,
    color: '#d46b08',
    fontWeight: '500',
  },
  alertButton: {
    backgroundColor: '#ff4d4f',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  alertButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    alignItems: 'center',
    gap: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  listContainer: {
    padding: 16,
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
    flexWrap: 'wrap',
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
    color: '#ff4d4f',
  },
  disabledButton: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  disabledText: {
    color: '#ccc',
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
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  paginationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  paginationButtonDisabled: {
    backgroundColor: '#f5f5f5',
  },
  paginationButtonText: {
    marginHorizontal: 4,
    fontSize: 14,
    fontWeight: '500',
    color: '#1e3a8a',
  },
  paginationButtonTextDisabled: {
    color: '#ccc',
  },
  paginationInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  modalContent: {
    padding: 16,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
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
  metaInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
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
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
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
  primaryButtonText: {
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
});

export default ListaSugerencias;