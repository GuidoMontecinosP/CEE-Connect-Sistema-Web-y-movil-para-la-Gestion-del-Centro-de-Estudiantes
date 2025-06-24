import React, { useEffect, useState } from 'react';
import { votacionService } from '../services/votacion.services';
import { votoService } from '../services/voto.services';
import { Layout, Card, Button, Typography, Space, Row, Col, Tag, Spin, message, Divider, Radio, Badge, Menu } from 'antd';
import {AuditOutlined,FileTextOutlined,ArrowLeftOutlined, PieChartOutlined, CarryOutOutlined, EyeOutlined, CheckCircleOutlined, BarChartOutlined, StopOutlined, PlusOutlined, CheckOutlined, FilterOutlined, HomeOutlined, DesktopOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

function ListarVotaciones() {
  const [votaciones, setVotaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('activa');
  const [cerrandoVotacion, setCerrandoVotacion] = useState(null);
  const [votosUsuario, setVotosUsuario] = useState({}); // Para guardar qué votaciones ya votó el usuario
  const navigate = useNavigate();
  const { usuario } = useAuth();

  // Verificar si el usuario es administrador
  const esAdministrador = usuario?.rol?.nombre === 'administrador';
  const usuarioId = usuario?.id;

  useEffect(() => {
    cargarVotaciones();
  }, []);

  const cargarVotaciones = async () => {
    setLoading(true);
    try {
      const res = await votacionService.obtenerVotaciones();
      let votacionesData = res.data;
      
      // Si no es administrador, solo mostrar votaciones activas
      if (!esAdministrador) {
        votacionesData = votacionesData.filter(votacion => votacion.estado === 'activa');
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
              ? { ...v, estado: 'cerrada' }
              : v
          )
        );

        await Swal.fire({
          title: '¡Votación cerrada!',
          text: `La votación "${votacion.titulo}" ha sido cerrada exitosamente`,
          icon: 'success',
          confirmButtonColor: '#28a745',
          confirmButtonText: 'Entendido',
          timer: 3000,
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

  const getEstadoTag = (estado) => {
    const estadoConfig = {
      'activa': { color: 'success', icon: <CheckCircleOutlined />, text: 'Activa' },
      'cerrada': { color: 'default', icon: <StopOutlined />, text: 'Cerrada' }
    };

    const config = estadoConfig[estado] || { color: 'default', icon: null, text: estado };

    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // Función para obtener el tag de estado de voto
  const getVotoTag = (votacionId) => {
    if (votosUsuario[votacionId]) {
      return (
        <Tag color="green" icon={<CheckOutlined />} style={{ marginLeft: 8 }}>
          Votaste
        </Tag>
      );
    }
    return null;
  };

  // Opciones de filtro disponibles según el rol del usuario
  const getFiltroOptions = () => {
    const baseOptions = [
      {
        label: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <span>Activas</span>
            <Badge count={votaciones.filter(v => v.estado === 'activa').length} style={{ backgroundColor: '#52c41a' }} size="small" />
          </div>
        ),
        value: 'activa'
      }
    ];

    // Solo agregar opciones adicionales si es administrador
    if (esAdministrador) {
      baseOptions.push(
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
      );
    }

    return baseOptions;
  };

  const filtroOptions = getFiltroOptions();

  const votacionesFiltradas = filtroEstado === 'todas' 
    ? votaciones 
    : votaciones.filter(votacion => votacion.estado === filtroEstado);

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

  // Resetear filtro si no es administrador y está intentando ver votaciones cerradas o todas
  useEffect(() => {
    if (!esAdministrador && (filtroEstado === 'cerrada' || filtroEstado === 'todas')) {
      setFiltroEstado('activa');
    }
  }, [esAdministrador, filtroEstado]);

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#1e3a8a' }}>
       <Sider theme="dark" collapsible>
        <Menu
          mode="inline"
          theme="dark"
          defaultSelectedKeys={['1']}
          items={items}
          onClick={onMenuClick}
          style={{ 
            height: '100%', 
            borderRight: 0
          }}
        />
      </Sider>
      <Layout>
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
                    : 'Consulta las votaciones activas disponibles'
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

            {/* Solo mostrar filtros si es administrador o si hay más de una opción */}
            {filtroOptions.length > 1 && (
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
            )}

            <div style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 16, color: '#64748b' }}>
                Mostrando {votacionesFiltradas.length} de {votaciones.length} votaciones
                {filtroEstado !== 'todas' && esAdministrador && (
                  <Tag color="blue" style={{ marginLeft: 8 }}>
                    {filtroOptions.find(opt => opt.value === filtroEstado)?.label.props.children[1]}
                  </Tag>
                )}
              </Text>
            </div>

           {loading ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <Text style={{ color: '#64748b' }}>Cargando votaciones...</Text>
                </div>
              </div>
            ) : (
              <Row gutter={[24, 24]}>
                {votacionesFiltradas.map(votacion => {
                  const yaVoto = votosUsuario[votacion.id];
                  
                  return (
                    <Col xs={24} lg={12} key={votacion.id}>
                      <Card hoverable style={{ borderRadius: 12, border: '1px solid #e2e8f0', height: '100%' }} bodyStyle={{ padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                          <Title level={4} style={{ color: '#1e3a8a', margin: 0, flex: 1 }}>
                            {votacion.titulo}
                          </Title>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            {getEstadoTag(votacion.estado)}
                            {votacion.estado === 'activa' && getVotoTag(votacion.id)}
                          </div>
                        </div>

                        <Divider style={{ margin: '16px 0' }} />

                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                          {/* Primera fila - Acciones principales del usuario */}
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
                                icon={votacion.estado === 'activa' && !yaVoto ? <CheckCircleOutlined /> : <BarChartOutlined />}
                                onClick={() => {
                                  if (votacion.estado === 'activa' && !yaVoto) {
                                    window.location.href = `/votacion/${votacion.id}/votar`;
                                  } else {
                                    window.location.href = `/votacion/${votacion.id}/resultados`;
                                  }
                                }}
                                disabled={votacion.estado === 'activa' && yaVoto}
                                style={{
                                  backgroundColor: votacion.estado === 'activa' && !yaVoto ? '#1e3a8a' : 
                                                 yaVoto ? '#f0f0f0' : '#f8f9fa',
                                  borderColor: votacion.estado === 'activa' && !yaVoto ? '#1e3a8a' : 
                                              yaVoto ? '#d9d9d9' : '#64748b',
                                  color: votacion.estado === 'activa' && !yaVoto ? 'white' : 
                                        yaVoto ? '#00000040' : '#64748b',
                                  borderRadius: 6,
                                  height: 40,
                                  fontWeight: 500,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: yaVoto ? 'not-allowed' : 'pointer'
                                }}
                                title={yaVoto ? 'Ya has votado en esta votación' : ''}
                              >
                                {votacion.estado === 'activa' ? 
                                  (yaVoto ? 'Votaste' : 'Votar') : 
                                  'Resultados'
                                }
                              </Button>
                            </Col>
                          </Row>

                          {/* Segunda fila - Solo para votaciones activas Y solo si es administrador */}
                          {votacion.estado === 'activa' && esAdministrador && (
                            <Row gutter={[8, 8]}>
                              <Col span={12}>
                                <Button
                                  block
                                  icon={<BarChartOutlined />}
                                  onClick={() => window.location.href = `/votacion/${votacion.id}/resultados`}
                                  style={{ 
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
                              
                              <Col span={12}>
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
                              </Col>
                            </Row>
                          )}

                          {/* Fila adicional para usuarios no administradores con votaciones activas */}
                          {votacion.estado === 'activa' && !esAdministrador && (
                            <Row gutter={[8, 8]}>
                              <Col span={24}>
                                <Button
                                  block
                                  icon={<BarChartOutlined />}
                                  onClick={() => window.location.href = `/votacion/${votacion.id}/resultados`}
                                  style={{ 
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
      </Layout>
    </Layout>
  );
}

export default ListarVotaciones;