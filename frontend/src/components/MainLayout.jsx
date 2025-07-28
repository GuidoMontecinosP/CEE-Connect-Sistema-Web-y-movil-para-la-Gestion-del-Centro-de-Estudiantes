import React, { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import {
  DesktopOutlined,
  CarryOutOutlined,
  PieChartOutlined,
  FileTextOutlined,
  AuditOutlined,
  PlusOutlined,
  CalendarOutlined,
  ScheduleOutlined,
  EyeOutlined,
  FormOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Sider, Content } = Layout;

function getItem(label, key, icon, children) {
  return { key, icon, children, label };
}

const MainLayout = ({ children, breadcrumb, selectedKeyOverride }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuth();
  const token = theme.useToken().token;
const [collapsed, setCollapsed] = useState(false);

  // Determinar rol
 const rol = (usuario?.rol?.nombre || usuario?.rol || '').toLowerCase();
  let userRole;
  if (rol === 'superadmin') {
    userRole = 'superadmin';
  } else if (rol === 'administrador') {
    userRole = 'admin';
  } else {
    // aquí caen 'estudiante' y cualquier otro rol:
    userRole = 'user';
  }

  // Menús
  const adminItems = [
    getItem('Inicio', '0', <FileTextOutlined />),
    getItem('Votaciones', 'sub_votaciones', <PieChartOutlined />, [
      getItem('Lista de Votaciones', '1', <PieChartOutlined />),
      getItem('Crear Votación', '2', <PlusOutlined />),
    ]),
    getItem('Anuncios', '10', <DesktopOutlined />),
    getItem('Eventos', 'sub1', <CarryOutOutlined />, [
      getItem('Ver Eventos', '3', <CarryOutOutlined />),
      getItem('Agregar Evento', '6', <PlusOutlined />),
    ]),
    getItem('Sugerencias', '7', <CalendarOutlined />),
    getItem('Dashboard', '5', <AuditOutlined />),
   
  ];

  const userItems = [
    getItem('Inicio', '0', <FileTextOutlined />),
    getItem('Votaciones', '1', <PieChartOutlined />),
    getItem('Eventos', '4', <CarryOutOutlined />),
    getItem('Sugerencias', 'sub2', <CalendarOutlined />, [
      getItem('Crear Sugerencia', '9', <FormOutlined />),
      getItem('Ver Sugerencias', '7', <EyeOutlined />),
      getItem('Mis Sugerencias', '8', <ScheduleOutlined />),
    ]),
    getItem('Dashboard', '5', <AuditOutlined />),
  ];

  const superAdminItems = [
    getItem('Gestión de Usuarios', 'usuarios', <SettingOutlined />),
    getItem('Dashboard', '5', <AuditOutlined />),
  ];

  // Selección del menú
  const pathToKey = {
    '/': '0',
    '/votaciones': '1',
    '/crear': '2',
    '/VerEventos': '3',
    '/eventos': '4',
    '/dashboard': '5',
    '/crearEvento': '6',
    '/sugerencias': '7',
    '/mis-sugerencias': '8',
    '/sugerencias/nueva': '9',
    '/usuarios': 'usuarios',
    '/adminAnuncios': '10',
  };
  const selectedKey = selectedKeyOverride ?? (pathToKey[location.pathname] || '0');

  // Control de apertura de submenus
  const [openKeys, setOpenKeys] = useState(() => {
    if (location.pathname.startsWith('/votaciones') && userRole === 'admin') return ['sub_votaciones'];
    if (location.pathname.startsWith('/sugerencias')) return ['sub2'];
    if (location.pathname.startsWith('/VerEventos') || location.pathname.startsWith('/crearEvento'))
      return ['sub1'];
    return [];
  });

  // Click handler
  const onMenuClick = ({ key }) => {
    if (key === 'logout') return logout();
    const route = Object.entries(pathToKey).find(([, k]) => k === key)?.[0];
    if (route) navigate(route);
  };

  const itemsByRole = {
    superadmin: superAdminItems,
    admin: adminItems,
    user: userItems,
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
   <Sider
  collapsible
  collapsed={collapsed}
  onCollapse={setCollapsed}
  collapsedWidth={80}
  style={{
    position: 'fixed',
    height: '100vh',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
  }}
>
        <div className="logo" />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
          onClick={onMenuClick}
          items={itemsByRole[userRole]}
        />
      </Sider>
     <Layout style={{ marginLeft: collapsed ? 80 : 200, padding: '24px' }}>


        <Content style={{ margin: '0 0 24px' }}>
          {breadcrumb}
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: token.colorBgContainer,
              borderRadius: token.borderRadiusLG,
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
