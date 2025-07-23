import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { votacionService } from '../services/votacion.services';
import {
  Layout, Card, Button, Typography, Space, Row, Col, Tag, Spin, message, Table, Menu, Input,Breadcrumb
} from 'antd';
import {
  ArrowLeftOutlined, CheckCircleOutlined, StopOutlined, UserOutlined,
  CalendarOutlined, FileTextOutlined, PieChartOutlined, CarryOutOutlined,
  EyeOutlined, AuditOutlined, DesktopOutlined, SearchOutlined
} from '@ant-design/icons';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
import MainLayout from '../components/MainLayout';
function VerVotacion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [votacion, setVotacion] = useState(null);
  const [participantes, setParticipantes] = useState([]);
  const [totalVotos, setTotalVotos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const [globalSearchText, setGlobalSearchText] = useState('');

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
        messageApi.error('No se pudieron cargar los datos de la votación');
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

  // Función para filtro global
  const getFilteredData = () => {
    if (!globalSearchText) return participantes;
    
    return participantes.filter((record) => {
      const searchIn = [
        record.usuario?.id?.toString(),
        record.usuario?.nombre,
        record.usuario?.correo,
        record.fechaVoto ? new Date(record.fechaVoto).toLocaleString('es-ES') : ''
      ].join(' ').toLowerCase();
      
      return searchIn.includes(globalSearchText.toLowerCase());
    });
  };

  const columns = [
    
    {
      title: 'Nombre',
      dataIndex: ['usuario', 'nombre'],
      key: 'nombre',
      sorter: (a, b) => {
        const nameA = a.usuario?.nombre || '';
        const nameB = b.usuario?.nombre || '';
        return nameA.localeCompare(nameB);
      },
      sortDirections: ['descend', 'ascend'],
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
      sorter: (a, b) => {
        const emailA = a.usuario?.correo || '';
        const emailB = b.usuario?.correo || '';
        return emailA.localeCompare(emailB);
      },
      sortDirections: ['descend', 'ascend'],
      render: (correo) => <Text type="secondary">{correo || 'Sin correo'}</Text>
    },
    {
      title: 'Fecha de Voto',
      dataIndex: 'fechaVoto',
      key: 'fechaVoto',
      sorter: (a, b) => {
        const dateA = new Date(a.fechaVoto || 0);
        const dateB = new Date(b.fechaVoto || 0);
        return dateA - dateB;
      },
      sortDirections: ['descend', 'ascend'],
      defaultSortOrder: 'descend',
      render: (fecha) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CalendarOutlined style={{ marginRight: 8, color: '#1e3a8a' }} />
          <Text>{fecha ? new Date(fecha).toLocaleString('es-ES') : 'N/A'}</Text>
        </div>
      )
    }
  ];

  
  if (loading) {
    return (
      <MainLayout
    breadcrumb={
      <Breadcrumb style={{ margin: '14px 0' }}  />
    }
  >
          <Content style={{ padding: '48px 24px' }}>
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text style={{ color: '#64748b' }}>Cargando votación...</Text>
              </div>
            </div>
          </Content>
        </MainLayout>
    );
  }

  if (!votacion) {
    return (
      <MainLayout
    breadcrumb={
      <Breadcrumb style={{ margin: '14px 0' }}  />
    }
  >
          <Content style={{ padding: '48px 24px' }}>
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Text style={{ color: '#64748b', fontSize: '16px' }}>No se encontró la votación</Text>
            </div>
          </Content>
        </MainLayout>
    );
  }

  return (
    <MainLayout
    selectedKeyOverride="1" 
    breadcrumb={
      <Breadcrumb style={{ margin: '14px 0' }}  />
    }
  >
    {      contextHolder}
        <Content style={{ padding: '48px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <div style={{ flex: 1 }}>
               
                <Title level={1} style={{ color: '#1e3a8a', marginBottom: 8 }}>{votacion.titulo}</Title>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {getEstadoTag(votacion.estado)}
                </div>
              </div>
            </div>

            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0',padding: 24 }} >
                  <Title level={3} style={{ color: '#1e3a8a', marginBottom: 16 }}>
                    <EyeOutlined style={{ marginRight: 8 }} />
                    Opciones de Votación
                  </Title>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {votacion.opciones?.length > 0 ? votacion.opciones.map((opcion, index) => (
                      <Card key={opcion.id} size="small" style={{
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        padding: 16,
                      }} >
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
                <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0',padding:24 }} >
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

            <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0', marginTop: 24,padding:24 }} >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={3} style={{ color: '#1e3a8a', margin: 0 }}>
                  <UserOutlined style={{ marginRight: 8 }} />
                  Participantes ({getFilteredData().length})
                </Title>
                <Input
                  placeholder="Buscar en participantes..."
                  prefix={<SearchOutlined style={{ color: '#1e3a8a' }} />}
                  value={globalSearchText}
                  onChange={(e) => setGlobalSearchText(e.target.value)}
                  style={{ 
                    width: 300,
                    borderRadius: 8,
                    borderColor: '#1e3a8a'
                  }}
                  allowClear
                />
              </div>
              {participantes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Text style={{ color: '#64748b', fontSize: '16px' }}>
                    Aún no hay participantes en esta votación
                  </Text>
                </div>
              ) : (
                <Table
                  columns={columns}
                  dataSource={getFilteredData()}
                  rowKey={(record, index) => record.usuario?.id || index}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} de ${total} participantes`,
                  }}
                  scroll={{ x: 800 }}
                  size="middle"
                  bordered
                  tableLayout="auto"
                  style={{
                    '& .ant-table-thead > tr > th': {
                      backgroundColor: '#f8fafc',
                      fontWeight: 600,
                      color: '#1e3a8a'
                    }
                  }}
                />
              )}
            </Card>
          </div>
        </Content>
      </MainLayout>
  );
}

export default VerVotacion;