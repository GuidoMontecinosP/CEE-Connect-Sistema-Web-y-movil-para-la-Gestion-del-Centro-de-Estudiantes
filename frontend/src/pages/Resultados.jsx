import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
  Progress,
  Spin,
  message,
  Divider,
  Statistic,
  Empty
} from 'antd';
import { 
  ArrowLeftOutlined, 
  BarChartOutlined, 
  TrophyOutlined,
  UsergroupAddOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  FileTextOutlined
} from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

function Resultados() {
  const { id } = useParams();
  const [resultados, setResultados] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const getEstadoTag = (estado) => {
    const estadoConfig = {
      'activa': { color: 'success', icon: <CheckCircleOutlined />, text: 'Activa' },
      'cerrada': { color: 'default', icon: <StopOutlined />, text: 'Cerrada' },
      'pendiente': { color: 'warning', icon: <ClockCircleOutlined />, text: 'Pendiente' },
      'finalizada': { color: 'error', icon: <CheckOutlined />, text: 'Finalizada' }
    };

    const config = estadoConfig[estado] || { color: 'default', icon: null, text: estado };
    
    return (
      <Tag color={config.color} icon={config.icon} style={{ fontSize: 14, padding: '4px 12px' }}>
        {config.text}
      </Tag>
    );
  };

  const getTotalVotos = () => {
    if (!resultados || !resultados.resultados) return 0;
    return resultados.resultados.reduce((total, r) => total + r.votos, 0);
  };

  const getGanador = () => {
    if (!resultados || !resultados.resultados || resultados.resultados.length === 0) return null;
    return resultados.resultados.reduce((max, current) => 
      current.votos > max.votos ? current : max
    );
  };

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
                fontWeight: 500
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
              Resultados de Votación
            </Title>
          </div>
        </Header>
        <Content style={{ padding: '48px 24px' }}>
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text style={{ color: '#64748b' }}>Cargando resultados...</Text>
            </div>
          </div>
        </Content>
      </Layout>
    );
  }

  if (!resultados) {
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
                fontWeight: 500
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
              Resultados de Votación
            </Title>
          </div>
        </Header>
        <Content style={{ padding: '48px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
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
                      No se pudieron cargar los resultados
                    </Text>
                    <Text style={{ color: '#94a3b8' }}>
                      La votación no existe o no tienes permisos para verla
                    </Text>
                  </div>
                }
              />
            </Card>
          </div>
        </Content>
      </Layout>
    );
  }

  const totalVotos = getTotalVotos();
  const ganador = getGanador();

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
            Resultados de Votación
          </Title>
        </div>
      </Header>

      <Content style={{ padding: '48px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          {/* Header de la votación */}
          <Card
            style={{
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              marginBottom: 24,
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
            }}
            bodyStyle={{ padding: 32 }}
          >
            <Row align="middle" justify="space-between">
              <Col flex={1}>
                <div>
                  <Title level={2} style={{ color: 'white', marginBottom: 8 }}>
                    {resultados.votacion.titulo}
                  </Title>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 16 }}>
                    ID: {resultados.votacion.id}
                  </Text>
                </div>
              </Col>
              <Col>
                {getEstadoTag(resultados.votacion.estado)}
              </Col>
            </Row>
          </Card>

          {/* Estadísticas generales */}
          <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
            <Col xs={24} sm={8}>
              <Card
                style={{
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  textAlign: 'center'
                }}
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
                style={{
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  textAlign: 'center'
                }}
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
                style={{
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  textAlign: 'center'
                }}
                bodyStyle={{ padding: 24 }}
              >
                <Statistic
                  title="Opción Ganadora"
                  value={ganador ? getPorcentaje(ganador.votos) : 0}
                  suffix="%"
                  prefix={<TrophyOutlined style={{ color: '#f59e0b' }} />}
                  valueStyle={{ color: '#f59e0b', fontSize: 28, fontWeight: 600 }}
                />
              </Card>
            </Col>
          </Row>

          {/* Ganador destacado */}
          {ganador && totalVotos > 0 && (
            <Card
              style={{
                borderRadius: 12,
                border: '2px solid #f59e0b',
                marginBottom: 32,
                background: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)'
              }}
              bodyStyle={{ padding: 24 }}
            >
              <div style={{ textAlign: 'center' }}>
                <TrophyOutlined style={{ fontSize: 48, color: '#f59e0b', marginBottom: 16 }} />
                <Title level={3} style={{ color: '#92400e', marginBottom: 8 }}>
                  🏆 Opción Ganadora
                </Title>
                <Title level={2} style={{ color: '#92400e', marginBottom: 8 }}>
                  {ganador.opcion}
                </Title>
                <Text style={{ fontSize: 18, color: '#a16207' }}>
                  {ganador.votos} votos ({getPorcentaje(ganador.votos)}%)
                </Text>
              </div>
            </Card>
          )}

          {/* Resultados detallados */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <BarChartOutlined style={{ marginRight: 8, color: '#1e3a8a' }} />
                <span style={{ color: '#1e3a8a', fontWeight: 600 }}>
                  Resultados Detallados
                </span>
              </div>
            }
            style={{
              borderRadius: 12,
              border: '1px solid #e2e8f0'
            }}
            bodyStyle={{ padding: 32 }}
          >
            {resultados.resultados.length === 0 ? (
              <Empty
                description="No hay resultados disponibles"
                style={{ padding: '40px 0' }}
              />
            ) : (
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {resultados.resultados
                  .sort((a, b) => b.votos - a.votos)
                  .map((resultado, index) => (
                    <div key={index}>
                      <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
                        <Col>
                          <Text style={{ fontSize: 16, fontWeight: 500, color: '#1e3a8a' }}>
                            {resultado.opcion}
                          </Text>
                        </Col>
                        <Col>
                          <Space>
                            <Text style={{ fontSize: 14, color: '#64748b' }}>
                              {resultado.votos} votos
                            </Text>
                            <Tag color={getColorProgress(index)} style={{ minWidth: 60, textAlign: 'center' }}>
                              {getPorcentaje(resultado.votos)}%
                            </Tag>
                          </Space>
                        </Col>
                      </Row>
                      <Progress
                        percent={parseFloat(getPorcentaje(resultado.votos))}
                        strokeColor={getColorProgress(index)}
                        strokeWidth={12}
                        style={{ marginBottom: index < resultados.resultados.length - 1 ? 16 : 0 }}
                        format={() => ''}
                      />
                    </div>
                  ))}
              </Space>
            )}
          </Card>

          {/* Información adicional */}
          {resultados.votacion.descripcion && (
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FileTextOutlined style={{ marginRight: 8, color: '#1e3a8a' }} />
                  <span style={{ color: '#1e3a8a', fontWeight: 600 }}>
                    Descripción
                  </span>
                </div>
              }
              style={{
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                marginTop: 24
              }}
              bodyStyle={{ padding: 24 }}
            >
              <Text style={{ fontSize: 16, color: '#64748b', lineHeight: 1.6 }}>
                {resultados.votacion.descripcion}
              </Text>
            </Card>
          )}
        </div>
      </Content>

      <style jsx>{`
        .ant-progress-bg {
          border-radius: 6px !important;
        }
        .ant-progress-inner {
          border-radius: 6px !important;
          background-color: #f1f5f9 !important;
        }
      `}</style>
    </Layout>
  );
}

export default Resultados;