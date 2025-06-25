import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { MdEvent, MdDescription, MdPlace, MdLabel } from 'react-icons/md'

import { obtenerEventos} from "../services/eventos.services.js";
import { useAuth } from '../context/AuthContext';

import {
  DesktopOutlined,
  CarryOutOutlined,
  PieChartOutlined,
  HomeOutlined,
  CalendarOutlined,
  LogoutOutlined,
    FileTextOutlined,
    AuditOutlined,
} from '@ant-design/icons';
import { Breadcrumb, 
         Layout, 
         Menu, 
         theme, 
         Button, 
         Modal, 
         Input, 
         DatePicker, 
         Space, 
         TimePicker,
         Card
} from 'antd';

const { Header, Content, Footer, Sider } = Layout;

function getItem(
  label,
  key,
  icon,
  children,
) {
  return {
    key,
    icon,
    children,
    label,
  };
}

// const items = [
//     getItem('Inicio', '0', <FileTextOutlined />),
//     getItem('Votaciones', '1', <PieChartOutlined />),
//     getItem('Crear Votacion', '2', <DesktopOutlined />),
//     getItem('Eventos', '3', <CarryOutOutlined />),
//     getItem('Dashboard', '5', <AuditOutlined />),
//     // getItem('Cerrar sesión', 'logout', <LogoutOutlined />), 
// ];


function Eventos (){
    const navigate = useNavigate();
    const [eventos, setEventos] = useState([]);
    const { usuario} = useAuth();

    useEffect(() => {
        obtenerEventos()
          .then(res => setEventos(res))
          .catch(err => alert(err.message));
      }, []);

    const { logout } = useAuth();
    const onMenuClick = (item) => {
    if (item.key === '0') {
      navigate('/');
    }
    if (item.key === '1') {
      navigate('/votaciones');
    }
    if (item.key === '2') {
      navigate('/crear');
    }
    if (item.key === '3') {
      navigate('/eventos');
    }
    if (item.key === '5') {
      navigate('/dashboard');
    }
    if (item.key === 'logout') {
      logout();
    }
  };

  // Filtrar items del menú según el rol
    const adminItems = [
      getItem('Inicio', '0', <FileTextOutlined />),
      getItem('Votaciones', '1', <PieChartOutlined />),
      getItem('Crear Votación', '2', <DesktopOutlined />),
      getItem('Eventos', '3', <CarryOutOutlined />),
      getItem('Dashboard', '5', <AuditOutlined />),
    ];
    const userItems = [
      getItem('Inicio', '0', <FileTextOutlined />),
      getItem('Votaciones', '1', <PieChartOutlined />),
      getItem('Eventos', '4', <CarryOutOutlined />),
      getItem('Dashboard', '5', <AuditOutlined />),
    ];

  const [collapsed, setCollapsed] = useState(false);
    const {
      token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <Layout style={{ minHeight: '100vh' }}>
                <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                  <div className="demo-logo-vertical" />
                  <Menu theme="dark" defaultSelectedKeys={['0']} mode="inline" items={usuario?.rol === 'administrador' || usuario?.rol?.nombre === 'administrador' ? adminItems : userItems} onClick={onMenuClick} />
                </Sider>
                <Layout>
                    <Content style={{ margin: '0 16px' }}>
                      <Breadcrumb style={{ margin: '14px 0' }} items={[{ title: 'Eventos' }]} />
                      <div
                        style={{
                          padding: 22,
                          minHeight: 360,
                          background: colorBgContainer,
                          borderRadius: borderRadiusLG,
                        }}
                      >
                        <h1> <MdEvent /> Eventos Proximos</h1>

                        {/* Solo mostrar el botón si el usuario es admin */}
                        {usuario?.rol?.nombre === 'administrador' && (
                          <Button 
                              type="primary"
                              style={{ marginBottom: 16 }}
                              onClick={ () => navigate('/verEventos')}
                          >
                            Gestion de Eventos
                          </Button>
                        )}
                      
                      {eventos.length === 0 ? (
                        <p>No hay eventos registrados.</p>
                      ) : (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                          flexWrap: 'wrap',
                          gap: 30,
                          marginTop: 24,
                          marginLeft: '20px',
                          
                        }}>
                          {eventos.map(e => {
                            // Formatear fecha de YYYY-MM-DD a DD-MM-YYYY
                            let fechaFormateada = e.fecha ? e.fecha.split('-').reverse().join('-') : '';
                            return (
                              <Card key={e.id} size="small" title={e.titulo} 
                              style={{ width: 300, boxShadow: '5px 10px 15px rgba(0,0,0,0.1)', }}>
                               <MdDescription/> Descripción: {e.descripcion} <br />
                               <MdEvent /> Fecha: {fechaFormateada} - Hora: {e.hora ?? ''}  <br />
                                <MdPlace />Lugar: {e.lugar} <br />
                               <MdLabel/> Tipo: {e.tipo} <br />
                              </Card>
                            );
                          })}
                        </div>
                      )}
                      </div>
                    </Content>
                    <Footer style={{ textAlign: 'center' }}>
                      ¡¡¡Created by Team Guido!!!
                    </Footer>
                  </Layout>
                </Layout>
    );
}

export default Eventos;