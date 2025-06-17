import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Breadcrumb, Layout, Menu, theme } from 'antd';

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

function Noticias() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('http://localhost:3000/api/noticias')
      .then(res => {
        if (!res.ok) throw new Error('Error al obtener noticias');
        return res.json();
      })
      .then(data => {
        setNoticias(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Extra: obtener imágenes de la noticia (scraping)
  // Si el backend no entrega imágenes, intentar obtener la imagen de la noticia por Open Graph (og:image) o buscar en el HTML
  // Si el backend ya entrega imágenes, solo mostrarla aquí

  // Renderizado mejorado con tarjetas
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
        <Menu theme="dark" defaultSelectedKeys={['0']} mode="inline" items={items} onClick={onMenuClick} />
      </Sider>
      <Layout>
        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb style={{ margin: '14px 0' }} items={[{ title: 'Noticias' }]} />
          <div
            style={{
              padding: 22,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <h1>Ultimas Noticias UBB</h1>
            {loading && <p>Cargando noticias...</p>}
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            {!loading && !error && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px',
                marginTop: 24
              }}>
                {noticias.map((n, i) => (
                  <div key={i} style={{
                    background: '#fff',
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    padding: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 180
                  }}>
                    {/* Imagen de la noticia si existe */}
                    {n.imagen ? (
                      <img src={n.imagen} alt={n.titulo} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }} />
                    ) : (
                      <div style={{ width: '100%', height: 160, background: '#eee', borderRadius: 8, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 18 }}>
                        Sin imagen
                      </div>
                    )}
                    <a href={n.enlace} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 'bold', fontSize: 18, color: '#1677ff', textDecoration: 'none', marginBottom: 8 }}>{n.titulo}</a>
                  </div>
                ))}
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

export default Noticias;