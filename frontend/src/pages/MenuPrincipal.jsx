import React, { useState } from 'react';
import { Layout, Menu, Card, Row, Col, Typography, Button, theme } from 'antd';
import { CheckCircleOutlined, PlusOutlined, HomeOutlined, PieChartOutlined, DesktopOutlined, CarryOutOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

function MenuPrincipal() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Estructura del menú adaptada al nuevo formato
  const menuItems = [
    { key: '0', icon: <HomeOutlined />, label: 'Inicio' },
    { key: '1', icon: <PieChartOutlined />, label: 'Votaciones' },
    ...(usuario?.rol === 'administrador'
      ? [{ key: '2', icon: <DesktopOutlined />, label: 'Crear Votación' }]
      : []),
    { key: '3', icon: <CarryOutOutlined />, label: 'Eventos' }
  ];

  const onMenuClick = (item) => {
    switch (item.key) {
      case '0':
        navigate('/');
        break;
      case '1':
        navigate('/votaciones');
        break;
      case '2':
        navigate('/crear');
        break;
      case '3':
        navigate('/eventos');
        break;
      default:
        console.log('Ruta no definida para:', item.key);
    }
  };

  const cardData = [
    {
      title: 'Listado de Votaciones',
      description: 'Consulta y gestiona todas las votaciones existentes',
      icon: <CheckCircleOutlined style={{ fontSize: 48, color: '#1e3a8a' }} />,
      link: '/votaciones',
      buttonText: 'Ver Votaciones',
    },
  ];

  // Agregar la opción de crear votación si el usuario es administrador
  if (usuario?.rol === 'administrador') {
    cardData.push({
      title: 'Crear Nueva Votación',
      description: 'Configura y crea una nueva sesión de votación',
      icon: <PlusOutlined style={{ fontSize: 48, color: '#1e3a8a' }} />,
      link: '/crear',
      buttonText: 'Crear Votación',
    });
  }

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar con el nuevo diseño */}
      <Sider theme="dark" collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <Menu
          mode="inline"
          theme="dark"
          defaultSelectedKeys={['0']}
          items={menuItems}
          onClick={onMenuClick}
          style={{ 
            height: '100%', 
            borderRight: 0
          }}
        />
      </Sider>

      {/* Main Content */}
      <Layout>
        <Content style={{ padding: '48px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <Title level={1} style={{ color: '#1e3a8a', marginBottom: 16 }}>
                Menú Principal
              </Title>
              <Text style={{ fontSize: 18, color: '#64748b' }}>
                Selecciona una opción para comenzar a trabajar con el sistema de votaciones
              </Text>
            </div>

            <Row gutter={[32, 32]} justify="center">
              {cardData.map((item, index) => (
                <Col xs={24} sm={24} md={12} lg={10} key={index}>
                  <Card
                    hoverable
                    style={{
                      height: '100%',
                      borderRadius: 12,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease',
                    }}
                    bodyStyle={{
                      padding: 32,
                      textAlign: 'center',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                    className="menu-card"
                  >
                    <div>
                      <div style={{ marginBottom: 24 }}>{item.icon}</div>
                      <Title level={3} style={{ color: '#1e3a8a', marginBottom: 16 }}>
                        {item.title}
                      </Title>
                      <Text style={{ color: '#64748b', fontSize: 16, lineHeight: 1.6 }}>
                        {item.description}
                      </Text>
                    </div>

                    <div style={{ marginTop: 32 }}>
                      <Button
                        type="primary"
                        size="large"
                        style={{
                          backgroundColor: '#1e3a8a',
                          borderColor: '#1e3a8a',
                          height: 48,
                          fontSize: 16,
                          fontWeight: 500,
                          borderRadius: 8,
                          width: '100%',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#1e40af';
                          e.target.style.borderColor = '#1e40af';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#1e3a8a';
                          e.target.style.borderColor = '#1e3a8a';
                        }}
                        onClick={() => navigate(item.link)}
                      >
                        {item.buttonText}
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default MenuPrincipal;