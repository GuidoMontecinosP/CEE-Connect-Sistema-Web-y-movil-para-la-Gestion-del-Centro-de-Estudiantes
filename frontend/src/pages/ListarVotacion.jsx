import React, { useEffect, useState, useCallback } from 'react';
import { votacionService } from '../services/votacion.services';
import { votoService } from '../services/voto.services';
import { 
  Layout, Card, Button, Typography, Space, Row, Col, Tag, Spin, message, 
  Divider, Radio, Badge, ConfigProvider, Modal, Input, Pagination, Empty, Select 
} from 'antd';
import { 
  CheckCircleOutlined, StopOutlined, BarChartOutlined, FilterOutlined, 
  PlusOutlined, EyeOutlined, CheckOutlined, SendOutlined, SearchOutlined,
  ReloadOutlined, ClearOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import esES from 'antd/locale/es_ES';
import MainLayout from '../components/MainLayout';
import { debounce } from 'lodash';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

function ListarVotaciones() {
  const [votaciones, setVotaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [filtroResultados, setFiltroResultados] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [cerrandoVotacion, setCerrandoVotacion] = useState(null);
  const [publicandoResultados, setPublicandoResultados] = useState(null);
  const [votosUsuario, setVotosUsuario] = useState({});
  
  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPorPagina, setItemsPorPagina] = useState(10);
  const [pagination, setPagination] = useState({});
  
  const navigate = useNavigate();
  const { usuario } = useAuth();
  
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();

  // Verificar roles del usuario
  const esAdministrador = usuario?.rol?.nombre === 'administrador';
  const esEstudiante = usuario?.rol?.nombre === 'estudiante';
  const usuarioId = usuario?.id;

  // Función para cargar votaciones con filtros y paginación
  const cargarVotaciones = useCallback(async (resetPage = false) => {
    setLoading(true);
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
          // Si hay filtro de resultados específico, aplicarlo
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
        // Los estudiantes solo pueden ver votaciones activas y cerradas con resultados publicados
        votacionesData = votacionesData.filter(votacion => 
          votacion.estado === 'activa' || 
          (votacion.estado === 'cerrada' && votacion.resultadosPublicados)
        );
      }
      
      setVotaciones(votacionesData);
      setPagination(res.pagination);
      setTotalItems(res.pagination.totalItems);
      
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
        setVotosUsuario(votosStatus);
      }
      
    } catch (err) {
      messageApi.error(`Error al cargar votaciones: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [paginaActual, itemsPorPagina, filtroEstado, filtroResultados, terminoBusqueda, esEstudiante, usuarioId, messageApi]);

  // Búsqueda con debounce
  const debouncedBusqueda = useCallback(
    debounce((termino) => {
      setTerminoBusqueda(termino);
      setPaginaActual(1); // Resetear a página 1 al buscar
    }, 500),
    []
  );

  // Efectos
  useEffect(() => {
    cargarVotaciones(true);
  }, [filtroEstado, filtroResultados, terminoBusqueda, itemsPorPagina]);

  useEffect(() => {
    if (paginaActual > 1) {
      cargarVotaciones();
    }
  }, [paginaActual]);

  const handleCerrarVotacion = async (votacion) => {
    if (!esAdministrador) {
      messageApi.error('No tienes permisos para cerrar votaciones');
      return;
    }

    modal.confirm({
      title: '¿Cerrar votación?',
      content: (
        <div style={{ textAlign: 'left', margin: '20px 0' }}>
          <p style={{ marginBottom: 10, color: '#666' }}>
            <strong>Votación:</strong> {votacion.titulo}
          </p>
          <p style={{ marginBottom: 15, color: '#666' }}>
            Esta acción no se puede deshacer. Una vez cerrada, no se podrán registrar más votos.
          </p>
          <p style={{ marginBottom: 15, color: '#d63384' }}>
            <strong>Nota:</strong> Los resultados no se publicarán automáticamente. Podrás publicarlos cuando desees.
          </p>
        </div>
      ),
      icon: null,
      okText: 'Sí, cerrar votación',
      cancelText: 'Cancelar',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setCerrandoVotacion(votacion.id);
          
          await votacionService.cerrarVotacion(votacion.id);
          
          // Recargar votaciones después de cerrar
          cargarVotaciones();
          
          messageApi.success({
            content: `La votación "${votacion.titulo}" ha sido cerrada exitosamente. Ahora puedes publicar los resultados cuando desees.`,
            duration: 3
          });
          
        } catch (error) {
          console.error('Error al cerrar votación:', error);
          messageApi.error(`No se pudo cerrar la votación "${votacion.titulo}"`);
        } finally {
          setCerrandoVotacion(null);
        }
      }
    });
  };

  const handlePublicarResultados = async (votacion) => {
    if (!esAdministrador) {
      messageApi.error('No tienes permisos para publicar resultados');
      return;
    }

    modal.confirm({
      title: '¿Publicar resultados?',
      content: (
        <div style={{ textAlign: 'left', margin: '20px 0' }}>
          <p style={{ marginBottom: 10, color: '#666' }}>
            <strong>Votación:</strong> {votacion.titulo}
          </p>
          <p style={{ marginBottom: 15, color: '#666' }}>
            Una vez publicados, los resultados serán visibles para todos los usuarios.
          </p>
          <p style={{ marginBottom: 15, color: '#28a745' }}>
            <strong>Nota:</strong> Los estudiantes podrán ver los resultados de esta votación.
          </p>
        </div>
      ),
      icon: null,
      okText: 'Sí, publicar resultados',
      cancelText: 'Cancelar',
      okButtonProps: { type: 'primary' },
      onOk: async () => {
        try {
          setPublicandoResultados(votacion.id);
          
          await votacionService.publicarResultados(votacion.id);
          
          // Recargar votaciones después de publicar
          cargarVotaciones();
          
          messageApi.success({
            content: `Los resultados de "${votacion.titulo}" ahora son visibles para todos los usuarios.`,
            duration: 3
          });
          
        } catch (error) {
          console.error('Error al publicar resultados:', error);
          messageApi.error(error.message || `No se pudieron publicar los resultados de "${votacion.titulo}"`);
        } finally {
          setPublicandoResultados(null);
        }
      }
    });
  };

  const getEstadoTag = (estado, resultadosPublicados) => {
    if (estado === 'activa') {
      return (
        <Tag color="success" icon={<CheckCircleOutlined />}>
          Activa
        </Tag>
      );
    } else if (estado === 'cerrada') {
      if (resultadosPublicados) {
        return (
          <Tag color="processing" icon={<BarChartOutlined />}>
            Publicada
          </Tag>
        );
      } else {
        return (
          <Tag color="default" icon={<StopOutlined />}>
            Cerrada
          </Tag>
        );
      }
    }
    
    return (
      <Tag color="default">
        {estado}
      </Tag>
    );
  };

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    setFiltroEstado('todas');
    setFiltroResultados(null);
    setTerminoBusqueda('');
    setPaginaActual(1);
  };

  // Verificar si hay filtros activos
  const hayFiltrosActivos = filtroEstado !== 'todas' || filtroResultados !== null || terminoBusqueda.trim() !== '';

  // Manejar cambio de estado y limpiar filtro de resultados si es necesario
  const handleCambioEstado = (valor) => {
    setFiltroEstado(valor || 'todas');
    // Si no es "cerrada", limpiar el filtro de resultados
    if (valor !== 'cerrada') {
      setFiltroResultados(null);
    }
    setPaginaActual(1);
  };

  // Cambiar página
  const handleCambiarPagina = (page, size) => {
    setPaginaActual(page);
    if (size !== itemsPorPagina) {
      setItemsPorPagina(size);
    }
  };

  return (
    <ConfigProvider locale={esES}>
      <MainLayout selectedKeyOverride="1" breadcrumb>
        {contextHolder}
        {modalContextHolder}
        <Content style={{ padding: '12px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <div>
                <Title level={1} style={{ color: '#1e3a8a', marginBottom: 6 }}>
                  Listado de Votaciones
                </Title>
                <Text style={{ fontSize: 16, color: '#64748b' }}>
                  {esAdministrador 
                    ? 'Gestiona y monitorea todas las votaciones del sistema'
                    : 'Consulta las votaciones activas y resultados publicados'
                  }
                </Text>
              </div>
              {esAdministrador && (
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/crear')}
                  style={{
                    backgroundColor: '#1e3a8a',
                    borderColor: '#1e3a8a',
                    borderRadius: 8,
                    height: 48,
                    paddingLeft: 24,
                    paddingRight: 24,
                    fontSize: 16,
                    fontWeight: 500
                  }}
                >
                  Nueva Votación
                </Button>
              )}
            </div>

            {/* Filtros y búsqueda */}
              <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <Input
                  placeholder="Buscar votaciones..."
                  prefix={<SearchOutlined style={{ color: '#1e3a8a' }} />}
                  allowClear
                  size="medium"
                  style={{ width: 300, borderRadius: 8 }}
                  onChange={(e) => debouncedBusqueda(e.target.value)}
                  onClear={() => {
                    setTerminoBusqueda('');
                    setPaginaActual(1);
                  }}
                />

                <Select
                  placeholder="Filtrar por estado"
                  value={filtroEstado}
                  onChange={handleCambioEstado}
                  style={{ width: 200 }}
                  size="medium"
                >
                  <Option value="todas">Todas</Option>
                  <Option value="activa">Activas</Option>
                  {esAdministrador && <Option value="cerrada">Cerradas</Option>}
                  <Option value="publicadas">Publicadas</Option>
                </Select>

                {/* Filtro de resultados - solo aparece si es admin y seleccionó "cerrada" */}
                {esAdministrador && filtroEstado === 'cerrada' && (
                  <Select
                    placeholder="Filtrar por resultados"
                    value={filtroResultados}
                    onChange={setFiltroResultados}
                    style={{ width: 200 }}
                    size="large"
                    allowClear
                  >
                    <Option value={true}>Publicadas</Option>
                    <Option value={false}>Sin publicar</Option>
                  </Select>
                )}

                {/* Botones para limpiar filtros y actualizar */}
                {hayFiltrosActivos && (
                  <>
                    
                    <Button 
                      icon={<ClearOutlined />} 
                      onClick={limpiarFiltros}
                      size= "medium"
                    >
                      Limpiar Filtros
                    </Button>
                  </>
                )}
              </div>
           

            {/* Lista de votaciones */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <Text style={{ color: '#64748b' }}>Cargando votaciones...</Text>
                </div>
              </div>
            ) : votaciones.length === 0 ? (
              <Empty
                description={
                  terminoBusqueda 
                    ? `No se encontraron votaciones para "${terminoBusqueda}"`
                    : "No hay votaciones disponibles"
                }
                style={{ padding: '80px 0' }}
              />
            ) : (
              <>
                <Row gutter={[24, 24]}>
                  {votaciones.map(votacion => {
                    const yaVoto = votosUsuario[votacion.id];
                    
                    return (
                      <Col xs={24} lg={12} key={votacion.id}>
                        <Card hoverable style={{ borderRadius: 12, border: '1px solid #e2e8f0', height: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <Title level={4} style={{ color: '#1e3a8a', margin: 0, flex: 1 }}>
                              {votacion.titulo}
                            </Title>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              {getEstadoTag(votacion.estado, votacion.resultadosPublicados)}
                            </div>
                          </div>

                          <Divider style={{ margin: '16px 0' }} />

                          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            {/* Si es estudiante */}
                            {esEstudiante ? (
                              <Row gutter={[8, 8]}>
                                {/* Votaciones activas: solo mostrar botón de votar */}
                                {votacion.estado === 'activa' && (
                                  <Col span={24}>
                                    <Button
                                      block
                                      icon={yaVoto ? <CheckOutlined /> : <CheckCircleOutlined />}
                                      onClick={() => {
                                        if (!yaVoto) {
                                          navigate(`/votacion/${votacion.id}/votar`);
                                        }
                                      }}
                                      disabled={yaVoto}
                                      style={{
                                        backgroundColor: yaVoto ? '#f0f0f0' : '#1e3a8a',
                                        borderColor: yaVoto ? '#d9d9d9' : '#1e3a8a',
                                        color: yaVoto ? '#00000040' : 'white',
                                        borderRadius: 6,
                                        height: 48,
                                        fontWeight: 500,
                                        fontSize: 16,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: yaVoto ? 'not-allowed' : 'pointer'
                                      }}
                                      title={yaVoto ? 'Ya has votado en esta votación' : 'Haz clic para votar'}
                                    >
                                      {yaVoto ? ' Votaste' : 'Votar'}
                                    </Button>
                                  </Col>
                                )}

                                {/* Votaciones cerradas con resultados publicados: mostrar botón de resultados */}
                                {votacion.estado === 'cerrada' && votacion.resultadosPublicados && (
                                  <Col span={24}>
                                    <Button
                                      block
                                      icon={<BarChartOutlined />}
                                      onClick={() => navigate(`/votacion/${votacion.id}/resultados`)}
                                      style={{
                                        backgroundColor: '#1e3a8a',
                                        borderColor: '#1e3a8a',
                                        color: 'white',
                                        borderRadius: 6,
                                        height: 48,
                                        fontWeight: 500,
                                        fontSize: 16,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                    >
                                      Ver Resultados
                                    </Button>
                                  </Col>
                                )}
                              </Row>
                            ) : (
                              /* Si es administrador */
                              <>
                                {/* Primera fila - Acciones principales */}
                                <Row gutter={[8, 8]}>
                                  <Col span={12}>
                                    <Button
                                      block
                                      icon={<EyeOutlined />}
                                      onClick={() => navigate(`/votacion/${votacion.id}`)}
                                      style={{ 
                                        borderColor: '#1e3a8a', 
                                        color: '#1e3a8a', 
                                        borderRadius: 6, 
                                        height: 40,
                                        fontWeight: 500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                    >
                                      Ver Detalles
                                    </Button>
                                  </Col>
                                  
                                  <Col span={12}>
                                    <Button
                                      block
                                      icon={<BarChartOutlined />}
                                      onClick={() => navigate(`/votacion/${votacion.id}/resultados`)}
                                      style={{
                                        backgroundColor: '#f8f9fa',
                                        borderColor: '#64748b',
                                        color: '#64748b',
                                        borderRadius: 6,
                                        height: 40,
                                        fontWeight: 500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                    >
                                      Ver Resultados
                                    </Button>
                                  </Col>
                                </Row>

                                {/* Segunda fila - Acciones según el estado */}
                                <Row gutter={[8, 8]}>
                                  <Col span={12}>
                                    <Button
                                      block
                                      icon={votacion.estado === 'activa' && !yaVoto ? <CheckCircleOutlined /> : <CheckOutlined />}
                                      onClick={() => {
                                        if (votacion.estado === 'activa' && !yaVoto) {
                                          navigate(`/votacion/${votacion.id}/votar`);
                                        }
                                      }}
                                      disabled={yaVoto || votacion.estado === 'cerrada'}
                                      style={{
                                        backgroundColor: votacion.estado === 'activa' && !yaVoto ? '#1e3a8a' : '#f0f0f0',
                                        borderColor: votacion.estado === 'activa' && !yaVoto ? '#1e3a8a' : '#d9d9d9',
                                        color: votacion.estado === 'activa' && !yaVoto ? 'white' : '#00000040',
                                        borderRadius: 6,
                                        height: 40,
                                        fontWeight: 500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: (yaVoto || votacion.estado === 'cerrada') ? 'not-allowed' : 'pointer'
                                      }}
                                      title={yaVoto ? 'Ya has votado en esta votación' : votacion.estado === 'cerrada' ? 'Votación cerrada' : ''}
                                    >
                                      {yaVoto ? 'Votaste' : 'Votar'}
                                    </Button>
                                  </Col>
                                  
                                  <Col span={12}>
                                    {/* Mostrar botón de Cerrar si está activa */}
                                    {votacion.estado === 'activa' && (
                                      <Button
                                        block
                                        danger
                                        icon={<StopOutlined />}
                                        loading={cerrandoVotacion === votacion.id}
                                        onClick={() => handleCerrarVotacion(votacion)}
                                        style={{ 
                                          borderRadius: 6, 
                                          height: 40,
                                          fontWeight: 500,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center'
                                        }}
                                      >
                                        {cerrandoVotacion === votacion.id ? 'Cerrando...' : 'Cerrar'}
                                      </Button>
                                    )}

                                    {/* Mostrar botón de Publicar si está cerrada y no publicada */}
                                    {votacion.estado === 'cerrada' && !votacion.resultadosPublicados && (
                                      <Button
                                        block
                                        type="primary"
                                        icon={<SendOutlined />}
                                        loading={publicandoResultados === votacion.id}
                                        onClick={() => handlePublicarResultados(votacion)}
                                        style={{ 
                                          backgroundColor: '#28a745',
                                          borderColor: '#28a745',
                                          borderRadius: 6, 
                                          height: 40,
                                          fontWeight: 500,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center'
                                        }}
                                      >
                                        {publicandoResultados === votacion.id ? 'Publicando...' : 'Publicar'}
                                      </Button>
                                    )}

                                    {/* Mostrar estado si está cerrada y publicada */}
                                    {votacion.estado === 'cerrada' && votacion.resultadosPublicados && (
                                      <Button
                                        block
                                        disabled
                                        icon={<CheckOutlined />}
                                        style={{ 
                                          backgroundColor: '#f0f0f0',
                                          borderColor: '#d9d9d9',
                                          color: '#00000040',
                                          borderRadius: 6, 
                                          height: 40,
                                          fontWeight: 500,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          cursor: 'not-allowed'
                                        }}
                                      >
                                        Publicado
                                      </Button>
                                    )}
                                  </Col>
                                </Row>
                              </>
                            )}
                          </Space>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>

                {/* Información de resultados y Paginación */}
                {totalItems > 0 && (
                  <div style={{ marginTop: 32 }}>
                    {/* Información de resultados */}
                    <div style={{ marginBottom: 16, textAlign: 'center' }}>
                      <Text style={{ color: '#64748b' }}>
                        Mostrando {((paginaActual - 1) * itemsPorPagina) + 1} - {Math.min(paginaActual * itemsPorPagina, totalItems)} de {totalItems} votaciones
                        {terminoBusqueda && ` para "${terminoBusqueda}"`}
                      </Text>
                    </div>

                    {/* Paginación */}
                    <div style={{ textAlign: 'center' }}>
                      <Pagination
                        current={paginaActual}
                        total={totalItems}
                        pageSize={itemsPorPagina}
                        onChange={handleCambiarPagina}
                        onShowSizeChange={handleCambiarPagina}
                        showSizeChanger
                        showQuickJumper
                        showTotal={(total, range) => 
                          `${range[0]}-${range[1]} de ${total} votaciones`
                        }
                        pageSizeOptions={['10', '20', '50']}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Content>
      </MainLayout>
    </ConfigProvider>
  );
}

export default ListarVotaciones;