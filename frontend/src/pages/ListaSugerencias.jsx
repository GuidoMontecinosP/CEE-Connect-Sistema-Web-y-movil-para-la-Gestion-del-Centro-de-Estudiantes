import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Table,
  Spin,
  Input,
  message,
  Button,
  Modal,
  Form,
  Select,
  Typography,
  Tag,
  Breadcrumb,
  DatePicker
} from 'antd';
import {
  SearchOutlined,
  MessageOutlined,
  EditOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { sugerenciasService } from '../services/sugerencia.services.js';
import { reportesService } from '../services/reporte.services.js';
import { muteoService } from '../services/muteado.services.js';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/MainLayout.jsx';
import dayjs from 'dayjs';


const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

export default function ListaSugerencias() {
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  //Paginación y filtros
  const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(10);
const [totalRecords, setTotalRecords] = useState(0);

// Estados para filtros (opcional)
const [categoriaFiltro, setCategoriaFiltro] = useState(null);
const [estadoFiltro, setEstadoFiltro] = useState(null);

const [loadingVaciarReportes, setLoadingVaciarReportes] = useState(false);

  const [form] = Form.useForm();
  const [reportForm] = Form.useForm();
  const [confirmandoEliminacion, setConfirmandoEliminacion] = useState(false);
  const [misReportes, setMisReportes] = useState([]); // IDs de sugerencias que YA reporté
  const [reportesDisponibles, setReportesDisponibles] = useState([]); // Para admin: lista de reportes pendientes
  const [reporteActualIndex, setReporteActualIndex] = useState(0); // Para admin: índice del reporte actual

  // Modal para ver mensaje de sugerencia
  const [msgModalVisible, setMsgModalVisible] = useState(false);
  const [mensajeActivo, setMensajeActivo] = useState('');
  const [msgAutor, setMsgAutor] = useState(null);
  const [msgFecha, setMsgFecha] = useState(null);

  // Modal para responder/editar respuesta admin
  const [respModalVisible, setRespModalVisible] = useState(false);
  const [sugerenciaSel, setSugerenciaSel] = useState(null);
  const [loadingResp, setLoadingResp] = useState(false);

  // Modal para ver respuesta admin
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewRespuesta, setViewRespuesta] = useState('');
  const [viewFecha, setViewFecha] = useState(null);
  const [viewAdmin, setViewAdmin] = useState(null);

  // Estados para reportes
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [sugerenciaAReportar, setSugerenciaAReportar] = useState(null);
  const [loadingReporte, setLoadingReporte] = useState(false);

  // Estados para gestión de reportes (admin)
  const [infoReporteVisible, setInfoReporteVisible] = useState(false);
  const [reporteInfo, setReporteInfo] = useState(null);
  const [loadingEliminarReporte, setLoadingEliminarReporte] = useState(false);
  const [loadingDesmuteo, setLoadingDesmuteo] = useState(false);


  // Estados para muteo
  const [muteoModalVisible, setMuteoModalVisible] = useState(false);
  const [muteoForm] = Form.useForm();
  const [usuarioAMutear, setUsuarioAMutear] = useState(null);
  const [loadingMuteo, setLoadingMuteo] = useState(false);
  const [tipoMuteo, setTipoMuteo] = useState(''); // 'reportador' o 'autor'

  const navigate = useNavigate();
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol?.nombre === 'administrador';
  const esEstud = usuario?.rol?.nombre === 'estudiante';

  const cargar = async (page = 1, limit = 10, filtros = {}) => {
    try {
      setLoading(true);
      
      const res = await sugerenciasService.obtenerSugerencias(page, limit, filtros);

    
    // Manejar la respuesta según la estructura de tu backend
    const data = res.data || res;
    setSugerencias(data.data || []);
    setTotalRecords(data.pagination?.total || 0);
    setCurrentPage(page);
    setPageSize(limit);

      
      // NUEVO: Cargar reportes del usuario actual (solo si es estudiante)
      if (esEstud) {
        try {
          const reportesRes = await reportesService.obtenerMisReportes();
          setMisReportes(reportesRes.data || []); // Array de IDs de sugerencias reportadas
          console.log('Mis reportes (IDs):', reportesRes.data);
        } catch (error) {
          console.error('Error al cargar mis reportes:', error);
          setMisReportes([]);
        }
      }
      
      // NUEVO: Cargar reportes disponibles (solo si es admin)
      if (esAdmin) {
  try {
    const reportesRes = await reportesService.obtenerReportes(1, 100);
    const reportesData = reportesRes.data?.data || [];
    
    // Obtener estado de muteo para cada usuario en los reportes
    const reportesConMuteo = await Promise.all(
      reportesData.map(async (reporte) => {
        try {
          // Verificar muteo del usuario que reportó
          let usuarioMuteado = false;
          if (reporte.usuario?.id) {
            const muteoUsuario = await muteoService.obtenerEstadoMuteo(reporte.usuario.id);
            usuarioMuteado = muteoUsuario.data?.isMuted || false;
          }
          
          // Verificar muteo del autor de la sugerencia
          let autorMuteado = false;
          if (reporte.sugerencia?.autor?.id) {
            const muteoAutor = await muteoService.obtenerEstadoMuteo(reporte.sugerencia.autor.id);
            autorMuteado = muteoAutor.data?.isMuted || false;
          }
          
          return {
            ...reporte,
            usuario: {
              ...reporte.usuario,
              isMuted: usuarioMuteado
            },
            sugerencia: {
              ...reporte.sugerencia,
              autor: {
                ...reporte.sugerencia?.autor,
                isMuted: autorMuteado
              }
            }
          };
        } catch (error) {
          console.error('Error al verificar muteo:', error);
          return reporte; // Devolver el reporte original si hay error
        }
      })
    );
    
    setReportesDisponibles(reportesConMuteo);
    setReporteActualIndex(0);
    console.log('Reportes disponibles:', reportesConMuteo.length);
  } catch (error) {
    console.error('Error al cargar reportes:', error);
    setReportesDisponibles([]);
  }
}

      
      arr.length
        ? message.success(`${arr.length} sugerencias cargadas`)
        : message.info('No hay sugerencias');
        
    } catch (err) {
      console.error('Error cargar sugerencias:', err);
      message.error('No se pudieron cargar sugerencias');
    } finally {
      setLoading(false);
    }
  };

  const buscarSugerencias = (valor) => {
  setSearchText(valor);
  
  // Limpiar timeout anterior
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  // Crear nuevo timeout
  const nuevoTimeout = setTimeout(() => {
    setCurrentPage(1); // Volver a la primera página
    cargar(1, pageSize, { 
      categoria: categoriaFiltro, 
      estado: estadoFiltro, 
      busqueda: valor 
    });
  }, 500);
  
  setSearchTimeout(nuevoTimeout);
};


useEffect(() => {
  cargar(currentPage, pageSize, { 
    categoria: categoriaFiltro, 
    estado: estadoFiltro,
    busqueda: searchText 
  });
}, [currentPage, pageSize, categoriaFiltro, estadoFiltro]);

const limpiarBusqueda = () => {
  setSearchText('');
  setCategoriaFiltro(null);
  setEstadoFiltro(null);
  setCurrentPage(1);
  cargar(1, pageSize, { 
    categoria: null, 
    estado: null, 
    busqueda: '' 
  });
};


  // const filtered = sugerencias.filter(s =>
  //   `${s.titulo} ${s.categoria} ${s.estado}`
  //     .toLowerCase()
  //     .includes(searchText.toLowerCase())
  // );

  const tagColor = estado => {
    const map = { pendiente: 'orange', 'en proceso': 'blue', resuelta: 'green', archivada: 'default' };
    return map[estado] || 'default';
  };

  const tieneResp = s => !!s?.respuestaAdmin && String(s.respuestaAdmin).trim() !== '';

  // FUNCIÓN ACTUALIZADA: Verificar si puedo reportar esta sugerencia
  const puedeReportar = (sugerencia) => {
    // Solo estudiantes pueden reportar
    if (!esEstud) return false;
    
    // No puede reportar sus propias sugerencias
    if (sugerencia.autor?.id === usuario?.id) return false;
    
    // No puede reportar sugerencias archivadas
    if (sugerencia.estado === 'archivada') return false;
    
    // NUEVO: No puede reportar sugerencias que ya reportó
    if (misReportes.includes(sugerencia.id)) return false;
    
    return true;
  };

  // Funciones para muteo
  const abrirMuteoModal = (usuario, tipo) => {
    setUsuarioAMutear(usuario);
    setTipoMuteo(tipo);
    muteoForm.resetFields();
    setMuteoModalVisible(true);
  };

  const mutearUsuario = async (valores) => {
  try {
    setLoadingMuteo(true);
    await muteoService.mutearUsuario(
      usuarioAMutear.id, 
      valores.razon, 
      valores.fecha_fin
    );
    
    console.log(`Usuario ${usuarioAMutear.nombre} muteado exitosamente`);
    message.success(`Usuario ${usuarioAMutear.nombre} muteado exitosamente`);
    setMuteoModalVisible(false);
    
    // ACTUALIZACIÓN INMEDIATA DEL ESTADO LOCAL
    if (reporteInfo) {
      // Actualizar el estado del usuario o autor según corresponda
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
      
      // También actualizar en la lista de reportes disponibles
      setReportesDisponibles(prev => prev.map(reporte => {
        if (reporte.id === reporteInfo.id) {
          if (tipoMuteo === 'reportador' && reporte.usuario?.id === usuarioAMutear.id) {
            return {
              ...reporte,
              usuario: {
                ...reporte.usuario,
                isMuted: true
              }
            };
          } else if (tipoMuteo === 'autor' && reporte.sugerencia?.autor?.id === usuarioAMutear.id) {
            return {
              ...reporte,
              sugerencia: {
                ...reporte.sugerencia,
                autor: {
                  ...reporte.sugerencia.autor,
                  isMuted: true
                }
              }
            };
          }
        }
        return reporte;
      }));
    }
    
  } catch (error) {
    console.error('Error al mutear usuario:', error);
    message.error(error.message || 'Error al mutear usuario');
  } finally {
    setLoadingMuteo(false);
  }
};

  const desmutearUsuario = async (userId, nombreUsuario) => {
  try {
    setLoadingDesmuteo(true);
    await muteoService.desmutearUsuario(userId);
    message.success(`Usuario ${nombreUsuario} desmuteado exitosamente`);
    
    // ACTUALIZACIÓN INMEDIATA DEL ESTADO LOCAL
    if (reporteInfo) {
      // Actualizar el estado del usuario reportador
      if (reporteInfo.usuario?.id === userId) {
        setReporteInfo(prev => ({
          ...prev,
          usuario: {
            ...prev.usuario,
            isMuted: false
          }
        }));
      }
      
      // Actualizar el estado del autor de la sugerencia
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
      
      // También actualizar en la lista de reportes disponibles
      setReportesDisponibles(prev => prev.map(reporte => {
        if (reporte.id === reporteInfo.id) {
          let reporteActualizado = { ...reporte };
          
          // Actualizar usuario reportador
          if (reporte.usuario?.id === userId) {
            reporteActualizado.usuario = {
              ...reporte.usuario,
              isMuted: false
            };
          }
          
          // Actualizar autor de la sugerencia
          if (reporte.sugerencia?.autor?.id === userId) {
            reporteActualizado.sugerencia = {
              ...reporte.sugerencia,
              autor: {
                ...reporte.sugerencia.autor,
                isMuted: false
              }
            };
          }
          
          return reporteActualizado;
        }
        return reporte;
      }));
    }
    
  } catch (error) {
    console.error('Error al desmutear usuario:', error);
    message.error(error.message || 'Error al desmutear usuario');
  } finally {
    setLoadingDesmuteo(false);
  }
};


  // Ver mensaje de sugerencia
  const abrirVerMensaje = s => {
    setMensajeActivo(s.mensaje);
    setMsgAutor(s.autor);
    setMsgFecha(s.createdAt); 
    setMsgModalVisible(true);
  };

  // Ver respuesta admin
  const abrirVerRespuesta = s => {
    if (!tieneResp(s)) {
      message.warning('Esta sugerencia aún no tiene respuesta');
      return;
    }
    setViewRespuesta(s.respuestaAdmin);
    setViewFecha(s.fechaRespuesta);
    setViewAdmin(s.adminResponsable);
    setViewModalVisible(true);
  };

  // Responder o editar respuesta
  const abrirResponder = s => {
  setSugerenciaSel(s);
  form.resetFields();
  if (tieneResp(s)) {
    form.setFieldsValue({ 
      estado: s.estado, 
      respuesta: s.respuestaAdmin 
    });
  } else {
    // Para nuevas respuestas, establecer el valor por defecto
    form.setFieldsValue({ 
      estado: 'resuelta' 
    });
  }
  setRespModalVisible(true);
};


  // Abrir modal de reporte
  const abrirReportar = (sugerencia) => {
    setSugerenciaAReportar(sugerencia);
    reportForm.resetFields();
    setReportModalVisible(true);
  };

  // FUNCIÓN ACTUALIZADA: Enviar reporte
  const enviarReporte = async (valores) => {
    try {
      setLoadingReporte(true);
      await reportesService.crearReporte(sugerenciaAReportar.id, valores.motivo);
      
      // NUEVO: Agregar la sugerencia a mis reportes inmediatamente
      setMisReportes(prev => [...prev, sugerenciaAReportar.id]);
      
      message.success('Reporte enviado exitosamente');
      setReportModalVisible(false);
      await cargar(); // Recargar para actualizar el estado
    } catch (err) {
      console.error('Error al enviar reporte:', err);
      message.error(err.message || 'No se pudo enviar el reporte');
    } finally {
      setLoadingReporte(false);
    }
  };

  // FUNCIÓN MEJORADA: Ver información del reporte
  const verInfoReporte = async (sugerencia) => {
    try {
      setLoadingEliminarReporte(true);
      
      // Buscar el reporte en la lista ya cargada
      const reporte = reportesDisponibles.find(r => r.sugerencia?.id === sugerencia.id);
      
      if (reporte) {
        // NUEVO: Actualizar el índice actual basado en el reporte encontrado
        const nuevoIndex = reportesDisponibles.findIndex(r => r.id === reporte.id);
        setReporteActualIndex(nuevoIndex >= 0 ? nuevoIndex : 0);
        
        setReporteInfo(reporte);
        setInfoReporteVisible(true);
      } else {
        message.error('No se encontró información del reporte');
      }
    } catch (error) {
      console.error('Error al obtener info del reporte:', error);
      message.error('Error al cargar información del reporte');
    } finally {
      setLoadingEliminarReporte(false);
    }
  };

  // FUNCIÓN ACTUALIZADA: Eliminar reporte
  const eliminarReporte = async () => {
    setLoadingEliminarReporte(true);
    
    try {
      await reportesService.eliminarReporte(reporteInfo.id);
      message.success('Reporte eliminado exitosamente');
      
      // Cerrar modal actual
      setInfoReporteVisible(false);
      setReporteInfo(null);
      setConfirmandoEliminacion(false);
      
      // NUEVO: Actualizar la lista de reportes disponibles
      const nuevosReportes = reportesDisponibles.filter(r => r.id !== reporteInfo.id);
      setReportesDisponibles(nuevosReportes);
      
      // NUEVO: Mostrar automáticamente el siguiente reporte si existe
      if (nuevosReportes.length > 0) {
        // Ajustar índice si es necesario
        const siguienteIndex = reporteActualIndex < nuevosReportes.length ? reporteActualIndex : 0;
        setReporteActualIndex(siguienteIndex);
        
        // Mostrar el siguiente reporte automáticamente
        setTimeout(() => {
          const siguienteReporte = nuevosReportes[siguienteIndex];
          if (siguienteReporte) {
            setReporteInfo(siguienteReporte);
            setInfoReporteVisible(true);
            message.info(`Mostrando siguiente reporte (${siguienteIndex + 1}/${nuevosReportes.length})`);
          }
        }, 500);
      } else {
        message.info('No hay más reportes pendientes');
      }
      
      // Recargar sugerencias para actualizar el estado
      await cargar();
      
    } catch (error) {
      console.error('Error al eliminar reporte:', error);
      message.error(error.message || 'Error al eliminar el reporte');
    } finally {
      setLoadingEliminarReporte(false);
    }
  };

  // NUEVA FUNCIÓN: Navegar reportes
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
  try {
    setLoadingVaciarReportes(true);
    await reportesService.vaciarReportesDeSugerencia(sugerenciaId);
    
    message.success('Todos los reportes de la sugerencia han sido eliminados');
    
    // Cerrar modal actual
    setInfoReporteVisible(false);
    setReporteInfo(null);
    
    // Actualizar la lista de reportes disponibles (remover todos los reportes de esta sugerencia)
    const nuevosReportes = reportesDisponibles.filter(r => r.sugerencia?.id !== sugerenciaId);
    setReportesDisponibles(nuevosReportes);
    
    // Mostrar automáticamente el siguiente reporte si existe
    if (nuevosReportes.length > 0) {
      const siguienteIndex = reporteActualIndex < nuevosReportes.length ? reporteActualIndex : 0;
      setReporteActualIndex(siguienteIndex);
      
      setTimeout(() => {
        const siguienteReporte = nuevosReportes[siguienteIndex];
        if (siguienteReporte) {
          setReporteInfo(siguienteReporte);
          setInfoReporteVisible(true);
          message.info(`Mostrando siguiente reporte (${siguienteIndex + 1}/${nuevosReportes.length})`);
        }
      }, 500);
    } else {
      message.info('No hay más reportes pendientes');
    }
    
    // Recargar sugerencias para actualizar el estado
    await cargar();
    
  } catch (error) {
    console.error('Error al vaciar reportes:', error);
    message.error(error.message || 'Error al vaciar reportes de la sugerencia');
  } finally {
    setLoadingVaciarReportes(false);
  }
};

  const enviarRespuesta = async vals => {
    try {
      setLoadingResp(true);
      await sugerenciasService.responderSugerencia(
        sugerenciaSel.id,
        vals.respuesta,
        vals.estado
      );
      message.success('Respuesta enviada');
      setRespModalVisible(false);
      await cargar();
    } catch (err) {
      console.error('Error enviar respuesta:', err);
      message.error('No se pudo enviar respuesta');
    } finally {
      setLoadingResp(false);
    }
  };

  const columns = [
   
    { 
      title: 'Título', 
      dataIndex: 'titulo', 
      key: 'titulo', 
      render: (titulo) => <Text strong>{titulo}</Text>
    },
   { 
  title: 'Categoría', 
  dataIndex: 'categoria', 
  key: 'categoria',
  render: (categoria) => {
    const categorias = {
      'eventos': 'Eventos',
      'infraestructura': 'Infraestructura',
      'bienestar': 'Bienestar',
      'otros': 'Otros'
    };
    return categorias[categoria] || categoria;
  }
},
    { title: 'Estado', dataIndex: 'estado', key: 'estado', render: e => <Tag color={tagColor(e)}>{e.toUpperCase()}</Tag> },
    { title: 'Fecha', dataIndex: 'createdAt', key: 'createdAt', render: f => f
        ? new Date(f).toLocaleString('es-CL', { year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false })
        : 'N/A' },
    {
      title: 'Mensaje',
      key: 'mensaje',
      align: 'center',
      render: (_, r) => (
        <Button icon={<MessageOutlined />} type='link' onClick={() => abrirVerMensaje(r)} />
      )
    },
    {
      title: 'Acciones', 
      key: 'acciones', 
      render: (_, r) => {
        if (esEstud) {
          const yaReporte = misReportes.includes(r.id);
          
          return (
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                disabled={!tieneResp(r)}
                icon={<MessageOutlined />}
                type='link'
                style={{ color: '#52c41a' }}
                onClick={() => abrirVerRespuesta(r)}
              >
                Ver Respuesta
              </Button>
              
              {/* BOTÓN MEJORADO: Muestra diferentes estados */}
              {puedeReportar(r) ? (
                <Button
                  icon={<ExclamationCircleOutlined />}
                  type='link'
                  danger
                  size='small'
                  onClick={() => abrirReportar(r)}
                >
                  Reportar
                </Button>
              ) : yaReporte ? (
                <Button
                  icon={<ExclamationCircleOutlined />}
                  type='link'
                  disabled
                  size='small'
                  title="Ya reportaste esta sugerencia"
                >
                  Reportado
                </Button>
              ) : null}
            </div>
          );
        }
        
        if (esAdmin) {
          return (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Button
                disabled={!tieneResp(r)}
                icon={<MessageOutlined />}
                type='link'
                style={{ color: '#52c41a' }}
                onClick={() => abrirVerRespuesta(r)}
              >
                Ver
              </Button>
              <Button
                disabled={r.estado === 'archivada'}
                icon={<EditOutlined />}
                type='primary'
                size='small'
                onClick={() => abrirResponder(r)}
              >
                {tieneResp(r) ? 'Editar' : 'Responder'}
              </Button>
              
              {/* BOTÓN MEJORADO: Muestra contador de reportes */}
              {r.isReportada && (
                <Button
                  icon={<ExclamationCircleOutlined />}
                  type='link'
                  style={{ color: '#ff4d4f' }}
                  onClick={() => verInfoReporte(r)}
                  title="Ver información del reporte"
                >
                  ! ({reportesDisponibles.filter(rep => rep.sugerencia?.id === r.id).length})
                </Button>
              )}
            </div>
          );
        }
        return null;
      }
    }
  ];

  return (
    <MainLayout breadcrumb={<Breadcrumb style={{ margin: '14px 0' }} />}>
      <Content style={{ padding: '48px 24px' }}>
        {/* NUEVO: Indicador de reportes pendientes (solo admin) */}
        {esAdmin && reportesDisponibles.length > 0 && (
          <div style={{ 
            backgroundColor: '#fff2f0', 
            border: '1px solid #ffccc7', 
            borderRadius: 6, 
            padding: 12, 
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
              <Text strong>Hay {reportesDisponibles.length} reportes pendientes de revisión</Text>
            </div>
            <Button
              type="primary"
              danger
              size="small"
              onClick={() => {
                if (reportesDisponibles.length > 0) {
                  setReporteInfo(reportesDisponibles[0]);
                  setReporteActualIndex(0);
                  setInfoReporteVisible(true);
                }
              }}
            >
              Revisar Reportes
            </Button>
          </div>
        )}

        {!esAdmin && (
          <div style={{ textAlign: 'right', marginBottom: 16 }}>
            <Button
              type='primary'
              size='large'
              style={{ backgroundColor: '#1e3a8a', borderRadius: 8, fontWeight: 'bold' }}
              onClick={() => navigate('/sugerencias/nueva')}>
              + Nueva sugerencia
            </Button>
          </div>
        )}
        
        <Title level={2} style={{ color: '#1e3a8a', marginBottom: 24 }}>
          {esAdmin ? 'Sugerencias Recibidas' : 'Sugerencias'}
        </Title>
        
      
<div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
  <Input
    placeholder='Buscar sugerencias...'
    prefix={<SearchOutlined style={{ color: '#1e3a8a' }} />}
    value={searchText}
    onChange={e => buscarSugerencias(e.target.value)}
    style={{ width: 300, borderRadius: 8 }}
    allowClear
    onClear={() => buscarSugerencias('')}
  />
  
  <Select
    placeholder="Filtrar por categoría"
    value={categoriaFiltro}
    onChange={(value) => {
      setCategoriaFiltro(value);
      setCurrentPage(1);
    }}
    style={{ width: 200 }}
    allowClear
  >
   
    <Option value="infraestructura">Infraestructura</Option>
    <Option value="eventos">Eventos</Option>
    
    <Option value="bienestar">Bienestar</Option>
    <Option value="otros">Otros</Option>
  </Select>
  
  <Select
    placeholder="Filtrar por estado"
    value={estadoFiltro}
    onChange={(value) => {
      setEstadoFiltro(value);
      setCurrentPage(1);
    }}
    style={{ width: 200 }}
    allowClear
  >
    <Option value="pendiente">Pendiente</Option>
    <Option value="en proceso">En proceso</Option>
    <Option value="resuelta">Resuelta</Option>
    <Option value="archivada">Archivada</Option>
  </Select>
  
  {/* Botón para limpiar todos los filtros */}
  {(categoriaFiltro || estadoFiltro || searchText) && (
    <Button
      onClick={() => {
        setCategoriaFiltro(null);
        setEstadoFiltro(null);
        setSearchText('');
        setCurrentPage(1);
      }}
      style={{ marginLeft: 8 }}
    >
      Limpiar filtros
    </Button>
  )}
</div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Spin size='large' />
            <div style={{ marginTop: 16 }}><Text>Cargando...</Text></div>
          </div>
        ) : (
          
         <Table
  columns={columns}
  dataSource={sugerencias} // Cambiar de 'filtered' a 'sugerencias'
  rowKey='id'
  pagination={{
    current: currentPage,
    pageSize: pageSize,
    total: totalRecords,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}–${range[1]} de ${total}`,
    onChange: (page, size) => {
      setCurrentPage(page);
      setPageSize(size);
    },
    onShowSizeChange: (current, size) => {
      setCurrentPage(1);
      setPageSize(size);
    }
  }}
  bordered
  locale={{ emptyText: 'Sin sugerencias' }}
/>
        )}

        {/* Modal para ver mensaje */}
        <Modal
          title="Mensaje de la Sugerencia"
          open={msgModalVisible}
          onCancel={() => setMsgModalVisible(false)}
          width={600}
          footer={<Button onClick={() => setMsgModalVisible(false)}>Cerrar</Button>}
        >
          <div
            style={{
              margin: '8px 0',
              padding: 12,
              backgroundColor: '#f5f5f5',
              borderRadius: 4
            }}
          >
            {mensajeActivo}
          </div>
          {msgFecha && (
            <Text type="secondary">
              Fecha: {new Date(msgFecha).toLocaleString('es-CL')}
            </Text>
          )}
          {msgAutor && (
            <Text
              type="secondary"
              style={{ display: 'block', marginTop: 4 }}
            >
              Autor: {msgAutor.nombre} {msgAutor.apellido}
                  <br/>
              Correo: {msgAutor.correo}
            </Text>
          )}
        </Modal>

        {/* Modal para ver respuesta admin */}
        <Modal
          title='Respuesta Administrativa'
          open={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={<Button onClick={() => setViewModalVisible(false)}>Cerrar</Button>}
          width={600}
        >
          <div style={{ margin: '8px 0', padding:12, backgroundColor:'#f5f5f5', borderRadius:4 }}>
            {viewRespuesta}
          </div>
          {viewFecha && <Text type='secondary'>Fecha: {new Date(viewFecha).toLocaleString('es-CL')}</Text>}
          {viewAdmin && <Text type='secondary' style={{ display:'block', marginTop:4 }}>Respondido por: {viewAdmin.nombre} {viewAdmin.apellido}</Text>}
        </Modal>

        {/* Modal para reportar sugerencia */}
        <Modal
          title={`Reportar sugerencia: "${sugerenciaAReportar?.titulo || ''}"`}
          open={reportModalVisible}
          onCancel={() => setReportModalVisible(false)}
          footer={null}
          width={500}
          styles={{
            body: {
              padding: '20px',
              backgroundColor: '#ffffff'
            }
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: '14px', color: '#666666' }}>
              Selecciona el motivo por el cual deseas reportar esta sugerencia:
            </Text>
          </div>
          <Form form={reportForm} layout='vertical' onFinish={enviarReporte}>
            <Form.Item 
              name='motivo' 
              label={<span style={{ color: '#333333', fontWeight: '500' }}>Motivo del reporte</span>}
              rules={[{ required: true, message: 'Selecciona un motivo' }]}
            >
              <Select 
                placeholder="Selecciona el motivo del reporte"
                style={{
                  backgroundColor: '#ffffff'
                }}
                dropdownStyle={{
                  backgroundColor: '#ffffff'
                }}
              >
                <Option value="contenido_inapropiado">Contenido inapropiado</Option>
                <Option value="spam">Spam</Option>
                <Option value="lenguaje_ofensivo">Lenguaje ofensivo</Option>
                <Option value="informacion_falsa">Información falsa</Option>
                <Option value="duplicado">Duplicado</Option>
                <Option value="otro">Otro</Option>
              </Select>
            </Form.Item>
            <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
              <Button 
                onClick={() => setReportModalVisible(false)} 
                style={{ 
                  marginRight: 8,
                  backgroundColor: '#f5f5f5',
                  borderColor: '#d9d9d9',
                  color: '#666666'
                }}
              >
                Cancelar
              </Button>
              <Button 
                type='primary' 
                htmlType='submit' 
                loading={loadingReporte} 
                danger
                style={{
                  backgroundColor: '#ff4d4f',
                  borderColor: '#ff4d4f'
                }}
              >
                Enviar Reporte
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal para ver información del reporte (solo admin) */}
        <Modal
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Información del Reporte - "{reporteInfo?.sugerencia?.titulo || ''}"</span>
              {reportesDisponibles.length > 1 && (
                <div>
                  <Button 
                    size="small" 
                    onClick={() => navegarReportes('anterior')}
                    disabled={reportesDisponibles.length <= 1}
                  >
                    ← Anterior
                  </Button>
                  <span style={{ margin: '0 8px', fontSize: '12px' }}>
                    {reporteActualIndex + 1} de {reportesDisponibles.length}
                  </span>
                  <Button 
                    size="small" 
                    onClick={() => navegarReportes('siguiente')}
                    disabled={reportesDisponibles.length <= 1}
                  >
                    Siguiente →
                  </Button>
                </div>
              )}
            </div>
          }
          open={infoReporteVisible}
          onCancel={() => setInfoReporteVisible(false)}
          footer={null}
          width={600}
        >
          {reporteInfo && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <Text strong>Motivo del reporte:</Text>
                <div style={{ marginTop: 8 }}>
                  <Tag color="red">
                    {reporteInfo.motivo === 'contenido_inapropiado' && 'Contenido inapropiado'}
                    {reporteInfo.motivo === 'spam' && 'Spam'}
                    {reporteInfo.motivo === 'lenguaje_ofensivo' && 'Lenguaje ofensivo'}
                    {reporteInfo.motivo === 'informacion_falsa' && 'Información falsa'}
                    {reporteInfo.motivo === 'duplicado' && 'Duplicado'}
                    {reporteInfo.motivo === 'otro' && 'Otro'}
                  </Tag>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <Text strong>Fecha del reporte:</Text>
                <div style={{ marginTop: 4 }}>
                  <Text>{new Date(reporteInfo.createdAt).toLocaleString('es-CL')}</Text>
                </div>
              </div>

              {/* Información del usuario que reportó */}
              <div style={{ marginBottom: 16 }}>
                <Text strong>Reportado por:</Text>
                <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Text>{reporteInfo.usuario?.nombre} {reporteInfo.usuario?.apellido}</Text>
                  {reporteInfo.usuario?.isMuted ? (
                    <Tag color="red">Muteado</Tag>
                  ) : null}
                </div>
                {esAdmin && (
  <div style={{ marginTop: 8 }}>
    {reporteInfo.usuario?.isMuted ? (
      <Button 
        type="link" 
        size="small"
        onClick={() => desmutearUsuario(reporteInfo.usuario?.id, reporteInfo.usuario?.nombre)}
        loading={loadingDesmuteo}
      >
        Desmutear usuario
      </Button>
    ) : (
     <Button 
  type="link" 
  size="small" 
  danger
  onClick={() => abrirMuteoModal(reporteInfo.usuario, 'reportador')}
>
  Mutear usuario
</Button>
    )}
  </div>
)}
              </div>

              {/* Información del autor de la sugerencia */}
              <div style={{ marginBottom: 16 }}>
                <Text strong>Autor de la sugerencia:</Text>
                <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Text>{reporteInfo.sugerencia?.autor?.nombre} {reporteInfo.sugerencia?.autor?.apellido}</Text>
                  {reporteInfo.sugerencia?.autor?.isMuted ? (
                    <Tag color="red">Muteado</Tag>
                  ) : null}
                </div>
                {esAdmin && (
                  <div style={{ marginTop: 8 }}>
                    {reporteInfo.sugerencia?.autor?.isMuted ? (
                      <Button 
                        type="link" 
                        size="small"
                        onClick={() => desmutearUsuario(reporteInfo.sugerencia?.autor?.id, reporteInfo.sugerencia?.autor?.nombre)}
                        loading={loadingDesmuteo}
                      >
                        Desmutear autor
                      </Button>
                    ) : (
                      <Button 
                        type="link" 
                        size="small" 
                        danger
                        onClick={() => abrirMuteoModal(reporteInfo.sugerencia?.autor, 'autor')}
                      >
                        Mutear autor
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Contenido de la sugerencia */}
              <div style={{ marginBottom: 16 }}>
                <Text strong>Contenido de la sugerencia:</Text>
                <div style={{ 
                  marginTop: 8, 
                  padding: 12, 
                  backgroundColor: '#f5f5f5', 
                  borderRadius: 4,
                  border: '1px solid #d9d9d9'
                }}>
                  <Text>{reporteInfo.sugerencia?.mensaje}</Text>
                </div>
              </div>

              {/* Botones de acción */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
                {/* Botón Vaciar reportes a la izquierda */}
                <Button 
                  type="primary"
                  onClick={() => vaciarReportes(reporteInfo.sugerencia?.id)}
                  loading={loadingVaciarReportes}
                >
                  Vaciar reportes
                </Button>
                 <div>
                  <Button 
                    onClick={() => setInfoReporteVisible(false)}
                    style={{ marginRight: 8 }}
                  >
                    Cerrar
                  </Button>
              <Button 
                    danger 
                    onClick={() => setConfirmandoEliminacion(true)}
                    loading={loadingEliminarReporte}
                  >
                    Eliminar Reporte
                  </Button>
                </div>
              </div>
              {/* Confirmación de eliminación */}
              {confirmandoEliminacion && (
                <div style={{ 
                  marginTop: 16, 
                  padding: 12, 
                  backgroundColor: '#fff1f0', 
                  border: '1px solid #ffccc7', 
                  borderRadius: 4 
                }}>
                  <Text strong style={{ color: '#ff4d4f' }}>
                    ¿Estás seguro de que deseas eliminar este reporte?
                  </Text>
                  <div style={{ marginTop: 8, textAlign: 'right' }}>
                    <Button 
                      size="small" 
                      onClick={() => setConfirmandoEliminacion(false)}
                      style={{ marginRight: 8 }}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      size="small" 
                      type="primary" 
                      danger 
                      onClick={eliminarReporte}
                      loading={loadingEliminarReporte}
                    >
                      Confirmar Eliminación
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Modal para mutear usuario */}
        <Modal
          title={`Mutear ${tipoMuteo === 'reportador' ? 'Usuario Reportador' : 'Autor de la Sugerencia'}`}
          open={muteoModalVisible}
          onCancel={() => setMuteoModalVisible(false)}
          footer={null}
          width={500}
        >
          {usuarioAMutear && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <Text>
                  Vas a mutear a: <Text strong>{usuarioAMutear.nombre} {usuarioAMutear.apellido}</Text>
                </Text>
              </div>
              <Form form={muteoForm} layout="vertical" onFinish={mutearUsuario}>
                <Form.Item
                  name="razon"
                  label="Razón del muteo"
                  rules={[{ required: true, message: 'Ingresa la razón del muteo' }]}
                >
                  <Select placeholder="Selecciona la razón del muteo">
                    <Option value="spam">Spam</Option>
                    <Option value="contenido_inapropiado">Contenido inapropiado</Option>
                    <Option value="lenguaje_ofensivo">Lenguaje ofensivo</Option>
                    <Option value="reportes_falsos">Reportes falsos</Option>
                    <Option value="conducta_disruptiva">Conducta disruptiva</Option>
                    <Option value="otro">Otro</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="fecha_fin"
                  label="Fecha fin del muteo"
                  rules={[{ required: true, message: 'Selecciona la fecha fin del muteo' }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    placeholder="Selecciona fecha y hora"
                  disabledDate={(current) => current && current < dayjs().endOf('day')}

                  />
                </Form.Item>
                <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
                  <Button 
                    onClick={() => setMuteoModalVisible(false)} 
                    style={{ marginRight: 8 }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="primary" 
                    danger 
                    htmlType="submit" 
                    loading={loadingMuteo}
                  >
                    Mutear Usuario
                  </Button>
                </Form.Item>
              </Form>
            </div>
          )}
        </Modal>

        {/* Modal para responder/editar respuesta admin */}
        <Modal
  title={tieneResp(sugerenciaSel) ? 'Editar Respuesta' : 'Responder Sugerencia'}
  open={respModalVisible}
  onCancel={() => setRespModalVisible(false)}
  footer={null}
  width={600}
>
  <Form 
    form={form} 
    layout='vertical' 
    onFinish={enviarRespuesta}
    initialValues={{ estado: 'resuelta' }}
  >
    <Form.Item 
      name='respuesta' 
      label='Respuesta'
      rules={[{ required: true, message: 'Ingresa una respuesta' }]}
    >
      <Input.TextArea rows={4} placeholder='Escribe tu respuesta aquí...' />
    </Form.Item>

    <Form.Item 
      name='estado' 
      label='Estado'
      rules={[{ required: true, message: 'Selecciona un estado' }]}
    >
      <Select placeholder='Selecciona el estado'>
        <Option value='pendiente'>Pendiente</Option>
        <Option value='en proceso'>En proceso</Option>
        <Option value='resuelta'>Resuelta</Option>
        <Option value='archivada'>Archivada</Option>
      </Select>
    </Form.Item>

    <Form.Item style={{ textAlign: 'right' }}>
      <Button onClick={() => setRespModalVisible(false)} style={{ marginRight: 8 }}>
        Cancelar
      </Button>
      <Button type='primary' htmlType='submit' loading={loadingResp}>
        {tieneResp(sugerenciaSel) ? 'Actualizar' : 'Enviar'} Respuesta
      </Button>
    </Form.Item>
  </Form>
</Modal>
      </Content>
    </MainLayout>
  );
}