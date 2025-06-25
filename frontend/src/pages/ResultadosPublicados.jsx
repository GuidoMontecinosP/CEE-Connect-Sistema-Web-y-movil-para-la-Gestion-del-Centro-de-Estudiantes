import React, { useEffect, useState } from 'react';
import { votacionService } from '../services/votacion.services';
import {
  Layout, Card, Button, Typography, Spin, Row, Col, Tag, message, Menu
} from 'antd';
import {
  BarChartOutlined, FileTextOutlined, PieChartOutlined,
  DesktopOutlined, CarryOutOutlined, AuditOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

function ResultadosPublicados() {
  const [votaciones, setVotaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const items = [
    { key: '0', icon: <FileTextOutlined />, label: 'Inicio' },
    { key: '1', icon: <PieChartOutlined />, label: 'Votaciones' },
    { key: '2', icon: <DesktopOutlined />, label: 'Crear Votación' },
    { key: '3', icon: <CarryOutOutlined />, label: 'Eventos' },
    { key: '4', icon: <BarChartOutlined />, label: 'Resultados' },
    { key: '5', icon: <AuditOutlined />, label: 'Dashboard' }
  ];

  const onMenuClick = (item) => {
    if (item.key === '0') navigate('/noticias');
    if (item.key === '1') navigate('/votaciones');
    if (item.key === '2') navigate('/crear');
    if (item.key === '3') navigate('/eventos');
    if (item.key === '4') navigate('/resultados-publicados');
    if (item.key === '5') navigate('/dashboard');
  };

  useEffect(() => {
    const cargarVotacionesPublicadas = async () => {
      try {
        const res = await votacionService.obtenerVotaciones();
        const votacionesPublicadas = res.data
          .filter(v => v.resultadosPublicados === true)
          .sort((a, b) => new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion));
        setVotaciones(votacionesPublicadas);
      } catch (error) {
        console.error(error);
        message.error('Error al cargar resultados publicados');
      } finally {
        setLoading(false);
      }
    };

    cargarVotacionesPublicadas();
  }, []);

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Sider theme="dark" collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <Menu mode="inline" theme="dark" defaultSelectedKeys={['4']} items={items} onClick={onMenuClick} />
      </Sider>

      <Layout>
        <Content style={{ padding: '48px 24px' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <Title level={2} style={{ color: '#1e3a8a' }}>
              Resultados de Votaciones Publicadas
            </Title>
            <Text style={{ fontSize: 16, color: '#64748b' }}>
              Aquí puedes consultar los resultados de las votaciones que han sido cerradas y publicadas.
            </Text>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <Spin size="large" />
              </div>
            ) : votaciones.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <Text>No hay votaciones publicadas disponibles.</Text>
              </div>
            ) : (
              <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
                {votaciones.map(votacion => (
                  <Col xs={24} md={12} key={votacion.id}>
                    <Card hoverable style={{ borderRadius: 12 }}>
                      <Title level={4} style={{ color: '#1e3a8a' }}>{votacion.titulo}</Title>
                      <Tag color="blue">Resultados Publicados</Tag>
                      <Button
                        type="primary"
                        icon={<BarChartOutlined />}
                        style={{ marginTop: 16 }}
                        onClick={() => navigate(`/votacion/${votacion.id}/resultados`)}
                      >
                        Ver Resultados
                      </Button>
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

export default ResultadosPublicados;
