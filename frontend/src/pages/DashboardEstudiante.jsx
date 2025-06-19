import { Card, Typography, Button, Layout, Menu, theme } from 'antd';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  HomeOutlined,
  PieChartOutlined,
  DesktopOutlined,
  CarryOutOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Content, Sider } = Layout;

export default function DashboardEstudiante() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Menú items basado en el rol del usuario
  const menuItems = [
    { key: '0', icon: <HomeOutlined />, label: 'Inicio' },
    { key: '1', icon: <PieChartOutlined />, label: 'Votaciones' },
    ...(usuario?.rol === 'administrador'
      ? [{ key: '2', icon: <DesktopOutlined />, label: 'Crear Votación' }]
      : []),
    { key: '3', icon: <CarryOutOutlined />, label: 'Eventos' },
    { key: '4', icon: <FileTextOutlined />, label: 'Noticias' }
  ];

  const onMenuClick = (item) => {
    if (item.key === '0') navigate('/');
    if (item.key === '1') navigate('/votaciones');
    if (item.key === '2') navigate('/crear');
    if (item.key === '3') navigate('/eventos');
    if (item.key === '4') navigate('/noticias');
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar */}
      <Sider theme="dark" collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
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
      
      <Layout>
        <Content style={{ padding: '48px 24px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: 'calc(100vh - 96px)'
          }}>
            <Card 
              style={{ 
                width: 500,
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              bodyStyle={{ padding: 40 }}
            >
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <Title level={2} style={{ color: '#1e3a8a', marginBottom: 8 }}>
                  ¡Bienvenido!
                </Title>
                <Title level={3} style={{ color: '#374151', marginBottom: 16 }}>
                  {usuario?.nombre || 'Estudiante'}
                </Title>
                <Paragraph style={{ fontSize: 16, color: '#64748b', marginBottom: 0 }}>
                  Rol: <strong style={{ color: '#1e3a8a' }}>{usuario?.rol}</strong>
                </Paragraph>
              </div>

              {/* Información adicional para estudiantes */}
              {usuario?.rol === 'estudiante' && (
                <Card 
                  style={{ 
                    backgroundColor: '#f1f5f9', 
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    marginBottom: 24
                  }}
                  bodyStyle={{ padding: 16 }}
                >
                  <Paragraph style={{ color: '#64748b', marginBottom: 8, fontSize: 14 }}>
                    💡 <strong>Como estudiante puedes:</strong>
                  </Paragraph>
                  <ul style={{ color: '#64748b', fontSize: 14, marginBottom: 0, paddingLeft: 20 }}>
                    <li>Ver y participar en votaciones activas</li>
                    <li>Consultar eventos próximos</li>
                    <li>Leer las últimas noticias de la universidad</li>
                  </ul>
                </Card>
              )}

              {/* Información adicional para administradores */}
              {usuario?.rol === 'administrador' && (
                <Card 
                  style={{ 
                    backgroundColor: '#fef3c7', 
                    border: '1px solid #f59e0b',
                    borderRadius: 8,
                    marginBottom: 24
                  }}
                  bodyStyle={{ padding: 16 }}
                >
                  <Paragraph style={{ color: '#92400e', marginBottom: 8, fontSize: 14 }}>
                    🛡️ <strong>Panel de Administrador:</strong>
                  </Paragraph>
                  <ul style={{ color: '#a16207', fontSize: 14, marginBottom: 0, paddingLeft: 20 }}>
                    <li>Crear y gestionar votaciones</li>
                    <li>Administrar eventos</li>
                    <li>Ver estadísticas completas</li>
                  </ul>
                </Card>
              )}

              <Button 
                type="primary" 
                danger 
                size="large"
                onClick={handleLogout}
                style={{
                  width: '100%',
                  height: 48,
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 500
                }}
              >
                Cerrar sesión
              </Button>
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}