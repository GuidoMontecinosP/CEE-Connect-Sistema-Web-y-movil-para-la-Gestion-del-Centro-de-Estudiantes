import { useEffect, useState } from 'react';
import { Breadcrumb, theme, Typography, Spin, Card } from 'antd';
import MainLayout from '../components/MainLayout.jsx';
import { obtenerAnuncios, obtenerNoticiasUBB } from '../services/anuncios.services.js';

const { Title, Text } = Typography;


function Noticias() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anuncios, setAnuncios] = useState([]);
  const [loadingAnuncio, setLoadingAnuncio] = useState(true);
  const [errorAnuncio, setErrorAnuncio] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    obtenerNoticiasUBB()
      .then(data => {
        setNoticias(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
    // Obtener anuncio CEE
    setLoadingAnuncio(true);
    setErrorAnuncio(null);
    obtenerAnuncios()
      .then(data => {
        setAnuncios(Array.isArray(data) ? data : []);
        setLoadingAnuncio(false);
      })
      .catch(() => {
        setErrorAnuncio('Error al obtener anuncios del CEE');
        setLoadingAnuncio(false);
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
            Últimas Noticias UBB
          </Title>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 32,
          alignItems: 'flex-start',
        }}>
          {/* Noticias UBB */}
          <div>
            {loading && <Spin />}
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
          {/* Anuncio CEE */}
          <div>
            <Card
              title={<span style={{ color: '#1e3a8a', fontWeight: 600 }}>Anuncios del CEE</span>}
              style={{ minHeight: 300, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            >
              {loadingAnuncio && <Spin />}
              {errorAnuncio && <p style={{ color: 'red' }}>{errorAnuncio}</p>}
              {!loadingAnuncio && !errorAnuncio && anuncios.length === 0 && (
                <Text>No hay anuncios del CEE.</Text>
              )}
              {!loadingAnuncio && !errorAnuncio && anuncios.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {anuncios.map((anuncio, idx) => (
                    <div key={anuncio.id || idx} style={{ borderBottom: '1px solid #eee', paddingBottom: 12 }}>
                      <Title level={4} style={{ marginBottom: 8 }}>{anuncio.titulo}</Title>
                      <Text style={{ fontSize: 16 }}>{anuncio.epilogo}</Text>
                      {anuncio.link && (
                        <div style={{ marginTop: 12 }}>
                          <a href={anuncio.link} target="_blank" rel="noopener noreferrer" style={{ color: '#1677ff', fontWeight: 500 }}>
                            Más información
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Noticias;