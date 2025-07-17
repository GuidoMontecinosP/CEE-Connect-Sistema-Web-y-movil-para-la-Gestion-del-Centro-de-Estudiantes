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
  PlusCircleOutlined,
  ScheduleOutlined,
  EyeOutlined,
  FormOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Sider, Content, Footer } = Layout;

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const MainLayout = ({ children, breadcrumb,selectedKeyOverride  }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuth();
  const [openKeys, setOpenKeys] = useState(() => {
    // Si la ruta actual es de un hijo de 'sub1' (eventos), abre 'sub1'
    if (['/VerEventos', '/crearEvento'].includes(location.pathname)) {
      return ['sub1'];
    }
    
    if (['/sugerencias/nueva', '/sugerencias', '/mis-sugerencias'].includes(location.pathname) && 
        usuario?.rol !== 'administrador' && usuario?.rol?.nombre !== 'administrador') {
      return ['sub2'];
    }
    return [];
  });
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Filtrar items del menú según el rol
  const adminItems = [
    getItem('Inicio', '0', <FileTextOutlined />),
    getItem('Votaciones', '1', <PieChartOutlined />),
    getItem('Crear Votación', '2', <DesktopOutlined />),
    getItem('Eventos', 'sub1', <CarryOutOutlined />, [
      getItem('Ver Eventos', '3', <CarryOutOutlined />),
      getItem('Agregar Eventos', '6', <PlusCircleOutlined />),
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
      getItem('Ver Mis Sugerencias', '8', <ScheduleOutlined />),
    ]),
    getItem('Dashboard', '5', <AuditOutlined />),
  ];

  const onMenuClick = (item) => {
    if (item.key === '0') navigate('/');
    if (item.key === '1') navigate('/votaciones');
    if (item.key === '2') navigate('/crear');
    if (item.key === '3') navigate('/VerEventos');
    if (item.key === '4') navigate('/eventos');
    if (item.key === '5') navigate('/dashboard');
    if (item.key === '6') navigate('/crearEvento');
    if (item.key === '7') navigate('/sugerencias');
    if (item.key === '8') navigate('/mis-sugerencias');
    if (item.key === '9') navigate('/sugerencias/nueva');
    if (item.key === 'logout') logout();
  };

  // Determinar la key seleccionada según la ruta
  const pathToKey = {
    '/': '0',
    '/votaciones': '1',
    '/crear': '2',
    '/eventos': '4',
    '/VerEventos': '3',
    '/dashboard': '5',
    '/crearEvento': '6',
    '/sugerencias': '7',
    '/mis-sugerencias': '8',
    '/sugerencias/nueva': '9',
  };
const selectedKey = 
    selectedKeyOverride != null 
      ? selectedKeyOverride 
      : (pathToKey[location.pathname] || '0');

 
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          defaultSelectedKeys={[selectedKey]}
          selectedKeys={[selectedKey]}
          mode="inline"
          items={usuario?.rol === 'administrador' || usuario?.rol?.nombre === 'administrador' ? adminItems : userItems}
          onClick={onMenuClick}
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
        />
      </Sider>
      <Layout style={{ padding: '0 24px 24px' }}>
        <Content style={{ margin: '0 16px' }}>
          {breadcrumb}
          <div
            style={{
              padding: 22,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
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