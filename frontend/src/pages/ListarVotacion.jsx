import React, { useEffect, useState } from 'react';
import { votacionService } from '../services/votacion.services';
import { Layout, Card, Button, Typography, Space, Row, Col, Tag, Spin, message, Divider, Radio, Badge, Menu } from 'antd';
import { ArrowLeftOutlined, PieChartOutlined, CarryOutOutlined, EyeOutlined, CheckCircleOutlined, BarChartOutlined, StopOutlined, PlusOutlined, CheckOutlined, FilterOutlined, HomeOutlined, DesktopOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

function ListarVotaciones() {
  const [votaciones, setVotaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('activa');
  const [cerrandoVotacion, setCerrandoVotacion] = useState(null);
  const navigate = useNavigate();

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

  const filtroOptions = [
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

  const votacionesFiltradas = filtroEstado === 'todas' 
    ? votaciones 
    : votaciones.filter(votacion => votacion.estado === filtroEstado);

  const items = [
    { key: '0', icon: <HomeOutlined />, label: 'Inicio' },
    { key: '1', icon: <PieChartOutlined />, label: 'Votaciones' },
    { key: '2', icon: <DesktopOutlined />, label: 'Crear Votación' },
    { key: '3', icon: <CarryOutOutlined />, label: 'Eventos' }
  ];

  const onMenuClick = (item) => {
    if (item.key === '0') navigate('/');
    if (item.key === '1') navigate('/votaciones');
    if (item.key === '2') navigate('/crear');
    if (item.key === '3') navigate('/eventos');
  };

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
                  Gestiona y monitorea todas las votaciones del sistema
                </Text>
              </div>
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
            </div>

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

            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <Text style={{ color: '#64748b' }}>Cargando votaciones...</Text>
                </div>
              </div>
            ) : (
              <Row gutter={[24, 24]}>
                {votacionesFiltradas.map(votacion => (
                  <Col xs={24} lg={12} key={votacion.id}>
                    <Card hoverable style={{ borderRadius: 12, border: '1px solid #e2e8f0', height: '100%' }} bodyStyle={{ padding: 24 }}>
                      <Title level={4} style={{ color: '#1e3a8a' }}>
                        {votacion.titulo}
                      </Title>
                      {getEstadoTag(votacion.estado)}

                      <Divider style={{ margin: '16px 0' }} />

                      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <Row gutter={[8, 8]}>
                          <Col span={12}>
                            <Button
                              block
                              icon={<EyeOutlined />}
                              onClick={() => window.location.href = `/votacion/${votacion.id}`}
                              style={{ borderColor: '#1e3a8a', color: '#1e3a8a', borderRadius: 6, height: 36 }}
                            >
                              Ver Detalle
                            </Button>
                          </Col>
                          <Col span={12}>
                            <Button
                              block
                              icon={<CheckCircleOutlined />}
                              onClick={() => window.location.href = `/votacion/${votacion.id}/votar`}
                              style={{ backgroundColor: '#1e3a8a', borderColor: '#1e3a8a', color: 'white', borderRadius: 6, height: 36 }}
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
                              onClick={() => window.location.href = `/votacion/${votacion.id}/resultados`}
                              style={{ borderColor: '#64748b', color: '#64748b', borderRadius: 6, height: 36 }}
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
                                style={{ borderRadius: 6, height: 36 }}
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
      </Layout>
    </Layout>
  );
}

export default ListarVotaciones;