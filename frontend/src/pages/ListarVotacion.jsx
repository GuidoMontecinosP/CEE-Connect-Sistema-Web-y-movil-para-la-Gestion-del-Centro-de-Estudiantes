import React, { useEffect, useState } from 'react';
import { votacionService } from '../services/votacion.services';
import { 
  Layout, 
  Card, 
  Button, 
  Typography, 
  Space, 
  Row, 
  Col, 
  Tag,
  Empty,
  Spin,
  message,
  Divider,
  Radio,
  Badge
} from 'antd';
import { 
  ArrowLeftOutlined, 
  EyeOutlined, 
  CheckCircleOutlined, 
  BarChartOutlined, 
  StopOutlined,
  PlusOutlined,
  CheckOutlined,
  FilterOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import Swal from 'sweetalert2';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

function ListarVotaciones() {
  const [votaciones, setVotaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('activa'); // Por defecto mostrar solo activas
  const [cerrandoVotacion, setCerrandoVotacion] = useState(null); // Para mostrar loading específico

  useEffect(() => {
    cargarVotaciones();
  }, []);

  const cargarVotaciones = () => {
    setLoading(true);
    votacionService.obtenerVotaciones()
      .then(res => {
        setVotaciones(res.data);
        setLoading(false);
      })
      .catch(err => {
        message.error(`Error al cargar votaciones: ${err.message}`);
        setLoading(false);
      });
  };

  const handleCerrarVotacion = async (votacion) => {
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
      customClass: {
        popup: 'swal-custom-popup',
        title: 'swal-custom-title',
        htmlContainer: 'swal-custom-html'
      }
    });

    if (result.isConfirmed) {
      try {
        setCerrandoVotacion(votacion.id);
        
        // Mostrar loading mientras se procesa
        Swal.fire({
          title: 'Cerrando votación...',
          text: 'Por favor espera un momento',
          icon: 'info',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        await votacionService.cerrarVotacion(votacion.id);
        
        // Actualizar el estado local inmediatamente
        setVotaciones(prevVotaciones => 
          prevVotaciones.map(v => 
            v.id === votacion.id 
              ? { ...v, estado: 'cerrada' }
              : v
          )
        );
        
        // Mostrar éxito
        await Swal.fire({
          title: '¡Votación cerrada!',
          html: `
            <div style="text-align: center; margin: 20px 0;">
              <p style="margin-bottom: 10px; color: #28a745; font-size: 16px;">
                <strong>"${votacion.titulo}"</strong>
              </p>
              <p style="color: #666;">
                La votación ha sido cerrada exitosamente
              </p>
            </div>
          `,
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
        
        // Mostrar error
        await Swal.fire({
          title: 'Error al cerrar votación',
          html: `
            <div style="text-align: left; margin: 20px 0;">
              <p style="margin-bottom: 10px; color: #dc3545;">
                No se pudo cerrar la votación "<strong>${votacion.titulo}</strong>"
              </p>
              <p style="color: #666; font-size: 14px;">
                <strong>Error:</strong> ${error.message}
              </p>
              <p style="color: #666; font-size: 14px; margin-top: 10px;">
                Por favor, inténtalo nuevamente o contacta al administrador del sistema.
              </p>
            </div>
          `,
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

  const handleAction = (path, action) => {
    // Aquí navegarías con react-router-dom
    console.log(`${action}: ${path}`);
    // navigate(path);
    window.location.href = path;
  };

  // Filtrar votaciones según el estado seleccionado
  const votacionesFiltradas = votaciones.filter(votacion => {
    if (filtroEstado === 'todas') return true;
    return votacion.estado === filtroEstado;
  });

  // Contar votaciones por estado
  const contarPorEstado = (estado) => {
    if (estado === 'todas') return votaciones.length;
    return votaciones.filter(v => v.estado === estado).length;
  };

  const filtroOptions = [
    {
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
          <span>Activas</span>
          <Badge 
            count={contarPorEstado('activa')} 
            style={{ backgroundColor: '#52c41a' }}
            size="small"
          />
        </div>
      ),
      value: 'activa'
    },
    {
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StopOutlined style={{ color: '#8c8c8c' }} />
          <span>Cerradas</span>
          <Badge 
            count={contarPorEstado('cerrada')} 
            style={{ backgroundColor: '#8c8c8c' }}
            size="small"
          />
        </div>
      ),
      value: 'cerrada'
    },
    {
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FilterOutlined style={{ color: '#1e3a8a' }} />
          <span>Todas</span>
          <Badge 
            count={contarPorEstado('todas')} 
            style={{ backgroundColor: '#1e3a8a' }}
            size="small"
          />
        </div>
      ),
      value: 'todas'
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Header 
        style={{ 
          backgroundColor: '#1e3a8a',
          padding: '0 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            style={{ 
              color: 'white', 
              marginRight: 16,
              height: 40,
              paddingLeft: 12,
              paddingRight: 16,
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 500,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
            onClick={() => window.history.back()}
          >
            Volver
          </Button>
          <Title 
            level={3} 
            style={{ 
              color: 'white', 
              margin: 0,
              fontWeight: 600
            }}
          >
            Sistema de Votaciones
          </Title>
        </div>
      </Header>

      <Content style={{ padding: '48px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          {/* Header de la página */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
            <div>
              <Title level={1} style={{ color: '#1e3a8a', marginBottom: 8 }}>
                Listado de Votaciones
              </Title>
              <Text style={{ fontSize: 16, color: '#64748b' }}>
                Gestiona y monitorea todas las votaciones del sistema
              </Text>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => handleAction('/crear', 'Crear nueva votación')}
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
          </div>

          {/* Filtros */}
          <Card
            style={{
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              marginBottom: 32
            }}
            styles={{ body: { padding: 24 } }}
          >
            <div style={{ marginBottom: 16 }}>
              <Title level={4} style={{ color: '#1e3a8a', margin: 0, display: 'flex', alignItems: 'center' }}>
                <FilterOutlined style={{ marginRight: 8 }} />
                Filtrar por Estado
              </Title>
            </div>
            <Radio.Group
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              style={{ width: '100%' }}
            >
              <Row gutter={[16, 16]}>
                {filtroOptions.map(option => (
                  <Col xs={24} sm={12} md={8} key={option.value}>
                    <Radio.Button 
                      value={option.value} 
                      style={{
                        width: '100%',
                        height: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 500,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {option.label}
                    </Radio.Button>
                  </Col>
                ))}
              </Row>
            </Radio.Group>
          </Card>

          {/* Resumen de filtros */}
          <div style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 16, color: '#64748b' }}>
              Mostrando {votacionesFiltradas.length} de {votaciones.length} votaciones
              {filtroEstado !== 'todas' && (
                <Tag color="blue" style={{ marginLeft: 8 }}>
                  {filtroOptions.find(opt => opt.value === filtroEstado)?.label.props.children[1]}
                </Tag>
              )}
            </Text>
          </div>

          {/* Contenido principal */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text style={{ color: '#64748b' }}>Cargando votaciones...</Text>
              </div>
            </div>
          ) : votacionesFiltradas.length === 0 ? (
            <Card
              style={{
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                textAlign: 'center',
                padding: '40px 20px'
              }}
            >
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <Text style={{ fontSize: 18, color: '#64748b', display: 'block', marginBottom: 8 }}>
                      {votaciones.length === 0 
                        ? 'No hay votaciones registradas'
                        : `No hay votaciones ${filtroEstado === 'todas' ? '' : filtroEstado + 's'}`
                      }
                    </Text>
                    <Text style={{ color: '#94a3b8' }}>
                      {votaciones.length === 0 
                        ? 'Comienza creando tu primera votación'
                        : `Intenta cambiar el filtro o crear una nueva votación`
                      }
                    </Text>
                  </div>
                }
              >
                <Space>
                  {votaciones.length === 0 && (
                    <Button
                      type="primary"
                      size="large"
                      icon={<PlusOutlined />}
                      onClick={() => handleAction('/crear', 'Crear primera votación')}
                      style={{
                        backgroundColor: '#1e3a8a',
                        borderColor: '#1e3a8a',
                        borderRadius: 8,
                        height: 48,
                        paddingLeft: 24,
                        paddingRight: 24,
                        fontSize: 16,
                        fontWeight: 500,
                        marginTop: 16
                      }}
                    >
                      Crear Primera Votación
                    </Button>
                  )}
                  {votaciones.length > 0 && filtroEstado !== 'todas' && (
                    <Button
                      size="large"
                      onClick={() => setFiltroEstado('todas')}
                      style={{
                        borderColor: '#1e3a8a',
                        color: '#1e3a8a',
                        borderRadius: 8,
                        height: 48,
                        paddingLeft: 24,
                        paddingRight: 24,
                        fontSize: 16,
                        fontWeight: 500,
                        marginTop: 16
                      }}
                    >
                      Ver Todas
                    </Button>
                  )}
                </Space>
              </Empty>
            </Card>
          ) : (
            <Row gutter={[24, 24]}>
              {votacionesFiltradas.map(votacion => (
                <Col xs={24} lg={12} key={votacion.id}>
                  <Card
                    hoverable
                    style={{
                      borderRadius: 12,
                      border: '1px solid #e2e8f0',
                      height: '100%',
                      transition: 'all 0.3s ease'
                    }}
                    styles={{ body: { padding: 24 } }}
                    className="votacion-card"
                  >
                    {/* Header de la card */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <Title level={4} style={{ color: '#1e3a8a', margin: 0, lineHeight: 1.3 }}>
                          {votacion.titulo}
                        </Title>
                        {getEstadoTag(votacion.estado)}
                      </div>
                      
                    </div>

                    <Divider style={{ margin: '16px 0' }} />

                    {/* Acciones */}
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <Row gutter={[8, 8]}>
                        <Col span={12}>
                          <Button
                            block
                            icon={<EyeOutlined />}
                            onClick={() => handleAction(`/votacion/${votacion.id}`, 'Ver detalle')}
                            style={{
                              borderColor: '#1e3a8a',
                              color: '#1e3a8a',
                              borderRadius: 6,
                              height: 36
                            }}
                          >
                            Ver Detalle
                          </Button>
                        </Col>
                        <Col span={12}>
                          <Button
                            block
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleAction(`/votacion/${votacion.id}/votar`, 'Votar')}
                            style={{
                              backgroundColor: '#1e3a8a',
                              borderColor: '#1e3a8a',
                              color: 'white',
                              borderRadius: 6,
                              height: 36
                            }}
                            disabled={votacion.estado !== 'activa'}
                          >
                            Votar
                          </Button>
                        </Col>
                      </Row>
                      
                      <Row gutter={[8, 8]}>
                        <Col span={votacion.estado === 'activa' ? 12 : 24}>
                          <Button
                            block
                            icon={<BarChartOutlined />}
                            onClick={() => handleAction(`/votacion/${votacion.id}/resultados`, 'Ver resultados')}
                            style={{
                              borderColor: '#64748b',
                              color: '#64748b',
                              borderRadius: 6,
                              height: 36
                            }}
                          >
                            Resultados
                          </Button>
                        </Col>
                        {votacion.estado === 'activa' && (
                          <Col span={12}>
                            <Button
                              block
                              danger
                              icon={<StopOutlined />}
                              loading={cerrandoVotacion === votacion.id}
                              onClick={() => handleCerrarVotacion(votacion)}
                              style={{
                                borderRadius: 6,
                                height: 36
                              }}
                            >
                              {cerrandoVotacion === votacion.id ? 'Cerrando...' : 'Cerrar'}
                            </Button>
                          </Col>
                        )}
                      </Row>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </Content>

      <style>{`
        .votacion-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
        }
        
        .ant-radio-button-wrapper {
          border-radius: 8px !important;
        }
        
        .ant-radio-button-wrapper:first-child {
          border-radius: 8px !important;
        }
        
        .ant-radio-button-wrapper:last-child {
          border-radius: 8px !important;
        }
        
        .ant-radio-button-wrapper-checked {
          background: #1e3a8a !important;
          border-color: #1e3a8a !important;
          color: white !important;
        }
        
        .ant-radio-button-wrapper-checked:hover {
          background: #1e40af !important;
          border-color: #1e40af !important;
        }

        /* Estilos personalizados para SweetAlert2 */
        .swal-custom-popup {
          border-radius: 12px !important;
          padding: 20px !important;
        }
        
        .swal-custom-title {
          color: #1e3a8a !important;
          font-size: 24px !important;
          font-weight: 600 !important;
        }
        
        .swal-custom-html {
          font-size: 16px !important;
          line-height: 1.5 !important;
        }
      `}</style>
    </Layout>
  );
}

export default ListarVotaciones;