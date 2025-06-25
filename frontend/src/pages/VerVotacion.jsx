import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { votacionService } from '../services/votacion.services';
import {
  Layout, Card, Button, Typography, Space, Row, Col, Tag, Spin, message, Table, Menu
} from 'antd';
import {
  ArrowLeftOutlined, CheckCircleOutlined, StopOutlined, UserOutlined,
  CalendarOutlined, FileTextOutlined, PieChartOutlined, CarryOutOutlined,
  EyeOutlined, AuditOutlined, DesktopOutlined
} from '@ant-design/icons';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

function VerVotacion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [votacion, setVotacion] = useState(null);
  const [participantes, setParticipantes] = useState([]);
  const [totalVotos, setTotalVotos] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);

        const votacionRes = await votacionService.obtenerVotacionPorId(id);
        setVotacion(votacionRes.data);

        const participantesRes = await votacionService.obtenerParticipantes(id);
        let participantesData = null;

        if (participantesRes?.data) {
          participantesData = participantesRes.data;
        } else if (participantesRes?.success) {
          participantesData = participantesRes;
        }

        if (participantesData && participantesData.success) {
          setParticipantes(participantesData.participantes || []);
          setTotalVotos(participantesData.totalVotos || 0);
        } else {
          setParticipantes([]);
        }
      } catch (err) {
        message.error('No se pudieron cargar los datos de la votación');
      } finally {
        setLoading(false);
      }
    };

    if (id) cargarDatos();
  }, [id]);

  const getEstadoTag = (estado) => {
    const estadoConfig = {
      'activa': { color: 'success', icon: <CheckCircleOutlined />, text: 'Activa' },
      'cerrada': { color: 'default', icon: <StopOutlined />, text: 'Cerrada' }
    };

    const config = estadoConfig[estado] || { color: 'default', icon: null, text: estado };

    return (
      <Tag color={config.color} icon={config.icon} style={{ fontSize: '14px', padding: '4px 12px' }}>
        {config.text}
      </Tag>
    );
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: ['usuario', 'id'],
      key: 'id',
      width: 80,
      render: (id) => <Text strong>{id || 'N/A'}</Text>
    },
    {
      title: 'Nombre',
      dataIndex: ['usuario', 'nombre'],
      key: 'nombre',
      render: (nombre) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <UserOutlined style={{ marginRight: 8, color: '#1e3a8a' }} />
          <Text strong>{nombre || 'Sin nombre'}</Text>
        </div>
      )
    },
    {
      title: 'Correo',
      dataIndex: ['usuario', 'correo'],
      key: 'correo',
      render: (correo) => <Text type="secondary">{correo || 'Sin correo'}</Text>
    },
    {
      title: 'Fecha de Voto',
      dataIndex: 'fechaVoto',
      key: 'fechaVoto',
      render: (fecha) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CalendarOutlined style={{ marginRight: 8, color: '#1e3a8a' }} />
          <Text>{fecha ? new Date(fecha).toLocaleString('es-ES') : 'N/A'}</Text>
        </div>
      )
    }
  ];

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

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: '#1e3a8a' }}>
        <Sider theme="dark" collapsible>
          <Menu mode="inline" theme="dark" defaultSelectedKeys={['1']} items={items} onClick={onMenuClick} />
        </Sider>
        <Layout>
          <Content style={{ padding: '48px 24px' }}>
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text style={{ color: '#64748b' }}>Cargando votación...</Text>
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }

  if (!votacion) {
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: '#1e3a8a' }}>
        <Sider theme="dark" collapsible>
          <Menu mode="inline" theme="dark" defaultSelectedKeys={['1']} items={items} onClick={onMenuClick} />
        </Sider>
        <Layout>
          <Content style={{ padding: '48px 24px' }}>
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Text style={{ color: '#64748b', fontSize: '16px' }}>No se encontró la votación</Text>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#1e3a8a' }}>
      <Sider theme="dark" collapsible>
        <Menu mode="inline" theme="dark" defaultSelectedKeys={['1']} items={items} onClick={onMenuClick} />
      </Sider>
      <Layout>
        <Content style={{ padding: '48px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <div style={{ flex: 1 }}>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/votaciones')}
                  style={{
                    marginBottom: 16,
                    borderColor: '#1e3a8a',
                    color: '#1e3a8a',
                    borderRadius: 6
                  }}
                >
                  Volver a Votaciones
                </Button>
                <Title level={1} style={{ color: '#1e3a8a', marginBottom: 8 }}>{votacion.titulo}</Title>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {getEstadoTag(votacion.estado)}
                  
                </div>
              </div>
            </div>

            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0' }} bodyStyle={{ padding: 24 }}>
                  <Title level={3} style={{ color: '#1e3a8a', marginBottom: 16 }}>
                    <EyeOutlined style={{ marginRight: 8 }} />
                    Opciones de Votación
                  </Title>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {votacion.opciones?.length > 0 ? votacion.opciones.map((opcion, index) => (
                      <Card key={opcion.id} size="small" style={{
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8
                      }} bodyStyle={{ padding: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text strong style={{ fontSize: '16px' }}>
                            {index + 1}. {opcion.textoOpcion}
                          </Text>
                          {opcion.votos !== undefined && (
                            <Tag color="blue" style={{ fontSize: '12px' }}>
                              {opcion.votos} votos
                            </Tag>
                          )}
                        </div>
                      </Card>
                    )) : (
                      <Text type="secondary">No hay opciones disponibles</Text>
                    )}
                  </Space>
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0' }} bodyStyle={{ padding: 24 }}>
                  <Title level={3} style={{ color: '#1e3a8a', marginBottom: 16 }}>
                    <UserOutlined style={{ marginRight: 8 }} />
                    Estadísticas de Participación
                  </Title>
                  <Card size="small" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <div style={{ textAlign: 'center' }}>
                      <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>{totalVotos}</Text>
                      <div style={{ color: '#64748b' }}>Votos Totales</div>
                    </div>
                  </Card>
                </Card>
              </Col>
            </Row>

            <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0', marginTop: 24 }} bodyStyle={{ padding: 24 }}>
              <Title level={3} style={{ color: '#1e3a8a', marginBottom: 16 }}>
                <UserOutlined style={{ marginRight: 8 }} />
                Participantes ({participantes.length})
              </Title>
              {participantes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Text style={{ color: '#64748b', fontSize: '16px' }}>
                    Aún no hay participantes en esta votación
                  </Text>
                </div>
              ) : (
                <Table
                  columns={columns}
                  dataSource={participantes}
                  rowKey={(record, index) => record.usuario?.id || index}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} de ${total} participantes`
                  }}
                />
              )}
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default VerVotacion;
