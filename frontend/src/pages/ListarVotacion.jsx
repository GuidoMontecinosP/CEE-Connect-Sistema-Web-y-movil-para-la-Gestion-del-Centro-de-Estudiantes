import { useEffect, useState } from 'react';
import { votacionService } from '../services/votacion.services';
import { Link } from 'react-router-dom';

import { useNavigate } from 'react-router-dom';

import { Breadcrumb, Layout, Menu, theme, Button, Modal, Input, DatePicker, Space, TimePicker } from 'antd';

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

import {
  DesktopOutlined,
  CarryOutOutlined,
  PieChartOutlined,
  HomeOutlined,
} from '@ant-design/icons';

const items = [
  getItem('Home', '0', <HomeOutlined /> ),
  getItem('Votaciones', '1', <PieChartOutlined />),
  getItem('Crear Votacion', '2', <DesktopOutlined />),
  getItem('Eventos', '3', <CarryOutOutlined />),
];

function ListarVotaciones() {
  const [votaciones, setVotaciones] = useState([]);

  useEffect(() => {
    votacionService.obtenerVotaciones()
      .then(res => setVotaciones(res.data))
      .catch(err => alert(err.message));
  }, []);

   const navigate = useNavigate();
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
  };

    const [collapsed, setCollapsed] = useState(false);
    const {
      token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

  return (
     <Layout style={{ minHeight: '100vh' }}>
          <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
            <div className="demo-logo-vertical" />
            <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} onClick={onMenuClick} />
          </Sider>
          <Layout>
        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb style={{ margin: '14px 0' }} items={[{ title: 'Votaciones' }]} />
          <div
            style={{
              padding: 22,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <h1>Listado De Votaciones</h1>
          </div>
          {votaciones.length === 0 ? (
        <p>No hay votaciones registradas.</p>
      ) : (
        <ul>
          {votaciones.map(v => (
            <li key={v.id}>
              <strong>{v.titulo}</strong> - Estado: {v.estado} <br />
              <Link to={`/votacion/${v.id}`}> Ver Detalle</Link> |{' '}
              <Link to={`/votacion/${v.id}/votar`}> Votar</Link> |{' '}
              <Link to={`/votacion/${v.id}/resultados`}> Resultados</Link> |{' '}
              {v.estado === 'activa' && (
                <Link to={`/votacion/${v.id}/cerrar`}> Cerrar</Link>
              )}
            </li>
          ))}
        </ul>
      )}
      </Content>
              <Footer style={{ textAlign: 'center' }}>
                ¡¡¡Created by Team Guido!!!
              </Footer>
            </Layout>
    </Layout>
  );
}

export default ListarVotaciones;