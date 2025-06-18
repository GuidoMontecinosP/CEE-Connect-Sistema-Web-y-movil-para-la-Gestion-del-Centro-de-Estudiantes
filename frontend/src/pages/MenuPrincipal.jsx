import React from 'react';
import { Layout, Menu, Card, Row, Col, Typography, Button } from 'antd';
import { CheckCircleOutlined, PlusOutlined, HomeOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Header, Content } = Layout;
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
          ? [{ key: 'crear', label: 'Crear Votación' }]
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
      <Header
        style={{
          backgroundColor: '#1e3a8a',
          padding: '0 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Title
            level={3}
            style={{
              color: 'white',
              margin: 0,
              marginRight: 32,
              fontWeight: 600,
            }}
          >
            Sistema de Votaciones
          </Title>
          <Menu
            theme="dark"
            mode="horizontal"
            items={menuItems}
            style={{
              backgroundColor: 'transparent',
              borderBottom: 'none',
              flex: 1,
            }}
            onClick={handleMenuClick}
          />
        </div>
      </Header>

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

      <style jsx>{`
        .menu-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
        }
        .ant-menu-horizontal > .ant-menu-item:hover,
        .ant-menu-horizontal > .ant-menu-submenu:hover,
        .ant-menu-horizontal > .ant-menu-item-active,
        .ant-menu-horizontal > .ant-menu-submenu-active,
        .ant-menu-horizontal > .ant-menu-item-open,
        .ant-menu-horizontal > .ant-menu-submenu-open,
        .ant-menu-horizontal > .ant-menu-item-selected,
        .ant-menu-horizontal > .ant-menu-submenu-selected {
          color: #ffffff !important;
          border-bottom-color: #ffffff !important;
        }
      `}</style>
    </Layout>
  );
}

export default MenuPrincipal;
