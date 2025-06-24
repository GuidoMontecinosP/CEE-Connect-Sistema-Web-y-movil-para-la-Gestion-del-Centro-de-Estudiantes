import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { votacionService } from '../services/votacion.services';
import { 
  Layout, Card, Button, Typography, Space, Row, Col, Tag, Progress, 
  Spin, message, Divider, Statistic, Empty, Menu, theme 
} from 'antd';
import { 
  AuditOutlined, ArrowLeftOutlined, BarChartOutlined, TrophyOutlined,
  UsergroupAddOutlined, CheckCircleOutlined, StopOutlined,
  FileTextOutlined, PieChartOutlined, CarryOutOutlined,
  DesktopOutlined 
} from '@ant-design/icons';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

function Resultados() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resultados, setResultados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    votacionService.obtenerResultados(id)
      .then(res => {
        setResultados(res.data);
        setLoading(false);
      })
      .catch(err => {
        message.error(`Error al cargar resultados: ${err.message}`);
        setLoading(false);
      });
  }, [id]);

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

  const getEstadoTag = (estado) => {
    const estadoConfig = {
      activa: { color: 'success', icon: <CheckCircleOutlined />, text: 'Activa' },
      cerrada: { color: 'default', icon: <StopOutlined />, text: 'Cerrada' },
    };
    const config = estadoConfig[estado] || { color: 'default', icon: null, text: estado };
    return <Tag color={config.color} icon={config.icon} style={{ fontSize: 14, padding: '4px 12px' }}>{config.text}</Tag>;
  };

  const getTotalVotos = () => resultados?.resultados?.reduce((sum, r) => sum + r.votos, 0) || 0;

  // Devuelve array de ganadores (puede ser empate)
  const getGanadores = () => {
    if (!resultados?.resultados?.length) return [];
    const votos = resultados.resultados.map(r => r.votos);
    const maxVotos = Math.max(...votos);
    return resultados.resultados.filter(r => r.votos === maxVotos);
  };

  const ganadores = getGanadores();

  const getPorcentaje = (votos) => {
    const total = getTotalVotos();
    return total > 0 ? ((votos / total) * 100).toFixed(1) : 0;
  };

  const getColorProgress = (index) => {
    const colors = ['#1e3a8a', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Sider theme="dark" collapsible collapsed={collapsed} onCollapse={setCollapsed}>
          <Menu mode="inline" theme="dark" defaultSelectedKeys={['1']} items={items} onClick={onMenuClick} />
        </Sider>
        <Layout>
          <Content style={{ padding: '48px 24px' }}>
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Spin size="large" />
              <Text style={{ color: '#64748b', marginTop: 16 }}>Cargando resultados...</Text>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }

  if (!resultados) {
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Sider theme="dark" collapsible collapsed={collapsed} onCollapse={setCollapsed}>
          <Menu mode="inline" theme="dark" defaultSelectedKeys={['1']} items={items} onClick={onMenuClick} />
        </Sider>
        <Layout>
          <Content style={{ padding: '48px 24px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0', padding: '40px 20px', textAlign: 'center' }}>
                <Empty description={<Text style={{ color: '#64748b', fontSize: 18 }}>No se pudieron cargar los resultados</Text>} />
              </Card>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }

  const totalVotos = getTotalVotos();

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Sider theme="dark" collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <Menu mode="inline" theme="dark" defaultSelectedKeys={['1']} items={items} onClick={onMenuClick} />
      </Sider>
      <Layout>
        <Content style={{ padding: '48px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>

            {/* Header */}
            <Card style={{ borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 24, background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' }} bodyStyle={{ padding: 32 }}>
              <Row justify="space-between" align="middle">
                <Col><Title level={2} style={{ color: 'white' }}>{resultados.votacion.titulo}</Title></Col>
                <Col>{getEstadoTag(resultados.votacion.estado)}</Col>
              </Row>
            </Card>

            {/* Stats Row con manejo de empate */}
           <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
  <Col xs={24} sm={8}>
    <Card
      style={{ borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}
      bodyStyle={{ padding: 24 }}
    >
      <Statistic
        title="Total de Votos"
        value={totalVotos}
        prefix={<UsergroupAddOutlined style={{ color: '#1e3a8a' }} />}
        valueStyle={{ color: '#1e3a8a', fontSize: 28, fontWeight: 600 }}
      />
    </Card>
  </Col>

  <Col xs={24} sm={8}>
    <Card
      style={{ borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}
      bodyStyle={{ padding: 24 }}
    >
      <Statistic
        title="Opciones"
        value={resultados.resultados.length}
        prefix={<FileTextOutlined style={{ color: '#3b82f6' }} />}
        valueStyle={{ color: '#3b82f6', fontSize: 28, fontWeight: 600 }}
      />
    </Card>
  </Col>

  <Col xs={24} sm={8}>
    <Card
      style={{ borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}
      bodyStyle={{ padding: 24 }}
    >
      {ganadores.length > 1 ? (
        <div>
          <Title level={4} style={{ marginBottom: 8, color: '#f59e0b' }}>
            🤝 Empate entre
          </Title>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#f59e0b',
              display: 'block',
            }}
          >
            {ganadores.map(g => g.opcion).join(' y ')}
          </Text>
        </div>
      ) : ganadores.length === 1 ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <TrophyOutlined style={{ color: '#f59e0b', fontSize: 30, marginRight: 8 }} />
            <Title level={4} style={{ margin: 0, color: '#f59e0b' }}>
              Opción Ganadora
            </Title>
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 'bold',
              color: '#1e3a8a',
              marginBottom: 8,
              textAlign: 'center',
              lineHeight: 1.2
            }}
          >
            {ganadores[0].opcion}
          </div>
          <Text
            style={{
              fontSize: 14,
              color: '#64748b',
              textAlign: 'center'
            }}
          >
            {getPorcentaje(ganadores[0].votos)}% de los votos
          </Text>
        </div>
      ) : (
        <div>
          <Title level={4} style={{ marginBottom: 8, color: '#64748b' }}>
            Sin Votos
          </Title>
          <Text style={{ color: '#64748b' }}>
            No hay votos registrados
          </Text>
        </div>
      )}
    </Card>
  </Col>
</Row>

            {/* Detalle de resultados y demás... */}
            <Card title={<><BarChartOutlined style={{ marginRight: 8, color: '#1e3a8a' }} />Resultados Detallados</>} style={{ borderRadius: 12, border: '1px solid #e2e8f0' }} bodyStyle={{ padding: 32 }}>
              {resultados.resultados.length === 0 ? (
                <Empty description="No hay resultados disponibles" />
              ) : (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  {resultados.resultados
                    .sort((a,b) => b.votos - a.votos)
                    .map((res, i) => (
                      <div key={i}>
                        <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
                          <Text style={{ fontSize: 16, fontWeight: 500, color: '#1e3a8a' }}>{res.opcion}</Text>
                          <Space>
                            <Text style={{ color: '#64748b' }}>{res.votos} votos</Text>
                            <Tag color={getColorProgress(i)}>{getPorcentaje(res.votos)}%</Tag>
                          </Space>
                        </Row>
                        <Progress percent={parseFloat(getPorcentaje(res.votos))} strokeColor={getColorProgress(i)} strokeWidth={12} format={() => ''} style={{ marginBottom: i < resultados.resultados.length - 1 ? 16 : 0 }} />
                      </div>
                    ))}
                </Space>
              )}
            </Card>

          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default Resultados;