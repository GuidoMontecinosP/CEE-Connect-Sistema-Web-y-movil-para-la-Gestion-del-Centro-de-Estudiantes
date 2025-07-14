import React, { useEffect, useState } from 'react';
import { votacionService } from '../services/votacion.services';
import { votoService } from '../services/voto.services';
import { Layout, Card, Button, Typography, Space, Row, Col, Tag, Spin, message, Divider, Radio, Badge, ConfigProvider,Breadcrumb } from 'antd';
import { CheckCircleOutlined, StopOutlined, BarChartOutlined, FilterOutlined, PlusOutlined, EyeOutlined, CheckOutlined,FileTextOutlined,PieChartOutlined,DesktopOutlined,CarryOutOutlined,AuditOutlined,SendOutlined  } from '@ant-design/icons';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import esES from 'antd/locale/es_ES';
import MainLayout from '../components/MainLayout';    
const { Content, Sider } = Layout;
const { Title, Text } = Typography;

function ListarVotaciones() {
  const [votaciones, setVotaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('activa'); 
  const [cerrandoVotacion, setCerrandoVotacion] = useState(null);
  const [publicandoResultados, setPublicandoResultados] = useState(null);
  const [votosUsuario, setVotosUsuario] = useState({}); // Para guardar qué votaciones ya votó el usuario
  const navigate = useNavigate();
  const { usuario } = useAuth();

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
      message.error(`Error al cargar votaciones: ${err.message}`);
      setLoading(false);
    }
  };

  const handleCerrarVotacion = async (votacion) => {
    // Solo permitir cerrar votaciones si es administrador
    if (!esAdministrador) {
      message.error('No tienes permisos para cerrar votaciones');
      return;
    }

    const result = await Swal.fire({
      title: '¿Cerrar votación?',
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <p style="margin-bottom: 10px; color: #666;">
            <strong>Votación:</strong> ${votacion.titulo}
          </p>
          <p style="margin-bottom: 15px; color: #666;">
            Esta acción no se puede deshacer. Una vez cerrada, no se podrán registrar más votos.
          </p>
          <p style="margin-bottom: 15px; color: #d63384;">
            <strong>Nota:</strong> Los resultados no se publicarán automáticamente. Podrás publicarlos cuando desees.
          </p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cerrar votación',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
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

        await Swal.fire({
          title: '¡Votación cerrada!',
          text: `La votación "${votacion.titulo}" ha sido cerrada exitosamente. Ahora puedes publicar los resultados cuando desees.`,
          icon: 'success',
          confirmButtonColor: '#28a745',
          confirmButtonText: 'Entendido',
          timer: 4000,
          timerProgressBar: true
        });

        setCerrandoVotacion(null);
      } catch (error) {
        console.error('Error al cerrar votación:', error);
        setCerrandoVotacion(null);

        await Swal.fire({
          title: 'Error al cerrar votación',
          text: `No se pudo cerrar la votación "${votacion.titulo}"`,
          icon: 'error',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido'
        });
      }
    }
  };

  const handlePublicarResultados = async (votacion) => {
    // Solo permitir publicar si es administrador
    if (!esAdministrador) {
      message.error('No tienes permisos para publicar resultados');
      return;
    }

    const result = await Swal.fire({
      title: '¿Publicar resultados?',
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <p style="margin-bottom: 10px; color: #666;">
            <strong>Votación:</strong> ${votacion.titulo}
          </p>
          <p style="margin-bottom: 15px; color: #666;">
            Una vez publicados, los resultados serán visibles para todos los usuarios.
          </p>
          <p style="margin-bottom: 15px; color: #28a745;">
            <strong>Nota:</strong> Los estudiantes podrán ver los resultados de esta votación.
          </p>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, publicar resultados',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
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

        await Swal.fire({
          title: '¡Resultados publicados!',
          text: `Los resultados de "${votacion.titulo}" ahora son visibles para todos los usuarios.`,
          icon: 'success',
          confirmButtonColor: '#28a745',
          confirmButtonText: 'Entendido',
          timer: 3000,
          timerProgressBar: true
        });

        setPublicandoResultados(null);
        
        // Recargar las votaciones para actualizar la vista
        //cargarVotaciones();
      } catch (error) {
        console.error('Error al publicar resultados:', error);
        setPublicandoResultados(null);

        await Swal.fire({
          title: 'Error al publicar resultados',
          text: error.message || `No se pudieron publicar los resultados de "${votacion.titulo}"`,
          icon: 'error',
          confirmButtonColor: '#dc3545',
          confirmButtonText: 'Entendido'
        });
      }
    }
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

  // Opciones de filtro disponibles según el rol del usuario
  const getFiltroOptions = () => {
    if (esAdministrador) {
      // Para administradores: todas las opciones
      return [
        {
          label: (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <span>Activas</span>
              <Badge count={votaciones.filter(v => v.estado === 'activa').length} style={{ backgroundColor: '#52c41a' }} size="small" />
            </div>
          ),
          value: 'activa'
        },
        {
          label: (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <StopOutlined style={{ color: '#8c8c8c' }} />
              <span>Cerradas</span>
              <Badge count={votaciones.filter(v => v.estado === 'cerrada').length} style={{ backgroundColor: '#8c8c8c' }} size="small" />
            </div>
          ),
          value: 'cerrada'
        },
        {
          label: (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FilterOutlined style={{ color: '#1e3a8a' }} />
              <span>Todas</span>
              <Badge count={votaciones.length} style={{ backgroundColor: '#1e3a8a' }} size="small" />
            </div>
          ),
          value: 'todas'
        }
      ];
    } else {
      // Para estudiantes: solo activas, publicadas y todas
      return [
        {
          label: (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <span>Activas</span>
              <Badge count={votaciones.filter(v => v.estado === 'activa').length} style={{ backgroundColor: '#52c41a' }} size="small" />
            </div>
          ),
          value: 'activa'
        },
        {
          label: (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChartOutlined style={{ color: '#1890ff' }} />
              <span>Publicadas</span>
              <Badge count={votaciones.filter(v => v.estado === 'cerrada' && v.resultadosPublicados).length} style={{ backgroundColor: '#1890ff' }} size="small" />
            </div>
          ),
          value: 'publicadas'
        },
        {
          label: (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FilterOutlined style={{ color: '#1e3a8a' }} />
              <span>Todas</span>
              <Badge count={votaciones.length} style={{ backgroundColor: '#1e3a8a' }} size="small" />
            </div>
          ),
          value: 'todas'
        }
      ];
    }
  };

  const filtroOptions = getFiltroOptions();

  // CAMBIO: Mejorar la lógica de filtrado
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

  const items = [
   { key: '0', icon: <FileTextOutlined />, label: 'Inicio' },
    { key: '1', icon: <PieChartOutlined />, label: 'Votaciones' },
    { key: '2', icon: <DesktopOutlined />, label: 'Crear Votación' },
    { key: '3', icon: <CarryOutOutlined />, label: 'Eventos' },
    
    { key: '5', icon: <AuditOutlined />, label: 'Dashboard' } 
  ];

  const onMenuClick = (item) => {
    if (item.key === '0') navigate('/noticias');
    if (item.key === '1') navigate('/votaciones');
    if (item.key === '2') navigate('/crear');
    if (item.key === '3') navigate('/eventos');
   
    if (item.key === '5') navigate('/dashboard');
  };

  // CAMBIO: Establecer filtro inicial según el rol
  useEffect(() => {
    if (esAdministrador && filtroEstado === 'publicadas') {
      setFiltroEstado('todas');
    }
  }, [esAdministrador]);

  return (
    <ConfigProvider locale={esES}>
      <MainLayout
    breadcrumb={
      <Breadcrumb style={{ margin: '14px 0' }}  />
    }
  >
          <Content style={{ padding: '48px 24px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
                <div>
                  <Title level={1} style={{ color: '#1e3a8a', marginBottom: 8 }}>
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
                    onClick={() => window.location.href = '/crear'}
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

              {/* Mostrar filtros */}
              <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 32 }} bodyStyle={{ padding: 24 }}>
                <Title level={4} style={{ color: '#1e3a8a', margin: 0, display: 'flex', alignItems: 'center' }}>
                  <FilterOutlined style={{ marginRight: 8 }} />
                  Filtrar por Estado
                </Title>
                <Radio.Group value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} style={{ width: '100%' }}>
                  <Row gutter={[16, 16]}>
                    {filtroOptions.map(option => (
                      <Col xs={24} sm={12} md={8} key={option.value}>
                        <Radio.Button value={option.value} style={{ width: '100%', height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, fontSize: 14, fontWeight: 500 }}>
                          {option.label}
                        </Radio.Button>
                      </Col>
                    ))}
                  </Row>
                </Radio.Group>
              </Card>

             {loading ? (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                  <Spin size="large" />
                  <div style={{ marginTop: 16 }}>
                    <Text style={{ color: '#64748b' }}>Cargando votaciones...</Text>
                  </div>
                </div>
              ) : (
                <Row gutter={[24, 24]}>
                  {votacionesFiltradas().map(votacion => {
                    const yaVoto = votosUsuario[votacion.id];
                    
                    return (
                      <Col xs={24} lg={12} key={votacion.id}>
                        <Card hoverable style={{ borderRadius: 12, border: '1px solid #e2e8f0', height: '100%' }} bodyStyle={{ padding: 24 }}>
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
                                          window.location.href = `/votacion/${votacion.id}/votar`;
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
                                      onClick={() => window.location.href = `/votacion/${votacion.id}/resultados`}
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
                                      onClick={() => window.location.href = `/votacion/${votacion.id}`}
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
                                      Ver Detalle
                                    </Button>
                                  </Col>
                                  
                                  <Col span={12}>
                                    <Button
                                      block
                                      icon={<BarChartOutlined />}
                                      onClick={() => window.location.href = `/votacion/${votacion.id}/resultados`}
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
                                          window.location.href = `/votacion/${votacion.id}/votar`;
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
              )}
            </div>
          </Content>
        </MainLayout>
    </ConfigProvider>
  );
}

export default ListarVotaciones;