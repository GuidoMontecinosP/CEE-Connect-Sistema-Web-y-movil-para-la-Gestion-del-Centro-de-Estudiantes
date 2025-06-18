import React from 'react';
import { Layout, Menu, Card, Row, Col, Typography, Button } from 'antd';
import { CheckCircleOutlined, PlusOutlined, HomeOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

function MenuPrincipal() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const handleMenuClick = (e) => {
    switch (e.key) {
      case 'home':
        navigate('/');
        break;
      case 'listar':
        navigate('/votaciones');
        break;
      case 'crear':
        navigate('/crear');
        break;
      default:
        console.log('Ruta no definida para:', e.key);
    }
  };

  // Estructura del menú con opciones dinámicas según el rol
  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: 'Inicio',
    },
    {
      key: 'votaciones',
      icon: <CheckCircleOutlined />,
      label: 'Votaciones',
      children: [
        { key: 'listar', label: 'Listar Votaciones' },
        ...(usuario?.rol === 'administrador'
          ? [{ key: 'crear', label: 'Crear Votación' }] // Solo administrador puede ver la opción de crear votación
          : []),
      ],
    },
  ];

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
      {/* Sidebar con color azul oscuro */}
      <Sider 
        theme="dark" 
        collapsible
        style={{
          backgroundColor: '#0f172a',
          borderRight: 'none'
        }}
      >
        <Menu
          mode="inline"
          defaultSelectedKeys={['home']}
          items={menuItems}
          style={{ 
            height: '100%', 
            borderRight: 0,
            backgroundColor: '#0f172a',
            color: 'white'
          }}
          onClick={handleMenuClick}
          theme="dark"
          className="custom-menu"
        />
        
        {/* Estilos CSS personalizados */}
        <style jsx>{`
          .ant-layout-sider {
            background: #0f172a !important;
          }
          
          .ant-layout-sider-trigger {
            background: #0f172a !important;
            border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
          }
          
          .custom-menu {
            background-color: #0f172a !important;
          }
          
          .custom-menu .ant-menu-item {
            background-color: transparent !important;
            color: white !important;
            border-radius: 6px !important;
            margin: 4px 8px !important;
          }
          
          .custom-menu .ant-menu-item:hover {
            background-color: rgba(255, 255, 255, 0.1) !important;
            color: white !important;
          }
          
          .custom-menu .ant-menu-item-selected {
            background-color: rgba(255, 255, 255, 0.15) !important;
            color: white !important;
          }
          
          .custom-menu .ant-menu-submenu-title {
            background-color: transparent !important;
            color: white !important;
            border-radius: 6px !important;
            margin: 4px 8px !important;
          }
          
          .custom-menu .ant-menu-submenu-title:hover {
            background-color: rgba(255, 255, 255, 0.1) !important;
            color: white !important;
          }
          
          .custom-menu .ant-menu-submenu-open > .ant-menu-submenu-title {
            background-color: rgba(255, 255, 255, 0.1) !important;
            color: white !important;
          }
          
          .custom-menu .ant-menu-submenu .ant-menu-item {
            background-color: transparent !important;
            color: rgba(255, 255, 255, 0.85) !important;
            padding-left: 48px !important;
          }
          
          .custom-menu .ant-menu-submenu .ant-menu-item:hover {
            background-color: rgba(255, 255, 255, 0.08) !important;
            color: white !important;
          }
          
          .custom-menu .ant-menu-submenu .ant-menu-item-selected {
            background-color: rgba(255, 255, 255, 0.12) !important;
            color: white !important;
          }
          
          .custom-menu .anticon {
            color: white !important;
          }
          
          .custom-menu .ant-menu-submenu-arrow {
            color: white !important;
          }
        `}</style>
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