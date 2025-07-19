import { useEffect, useState } from 'react';
import { Breadcrumb, theme, Typography } from 'antd';
import MainLayout from '../components/MainLayout.jsx';

const { Title, Text } = Typography;

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

    const {
      token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

  return (
    <MainLayout breadcrumb={<Breadcrumb style={{ margin: '14px 0' }} /> }>
      <div
        style={{
          padding: 22,
          minHeight: 360,
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Title level={1} style={{ color: '#1e3a8a', marginBottom: 8 }}>
              Ultimas Noticias UBB
            </Title>
           
          </div>

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
    </MainLayout>
  );
}

export default Noticias;