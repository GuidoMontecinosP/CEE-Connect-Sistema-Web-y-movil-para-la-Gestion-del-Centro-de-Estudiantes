import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { votacionService } from '../services/votacion.services';
import { votoService } from '../services/voto.services';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/MainLayout';
import { 
  Layout, 
  Card, 
  Button, 
  Typography, 
  Space, 
  Radio,
  message,
  Spin,
  Alert,
  Tag,
  Result,
  Divider,
  Menu,Breadcrumb
} from 'antd';
import { 
  ArrowLeftOutlined, 
  CheckCircleOutlined, 
  LockOutlined,
  SendOutlined,
  InfoCircleOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  PieChartOutlined,
  DesktopOutlined,
  CarryOutOutlined,
  FileTextOutlined,
  AuditOutlined,
} from '@ant-design/icons';

const { Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

function Votar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useAuth();
  const [votacion, setVotacion] = useState(null);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);
  const [yaVoto, setYaVoto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enviandoVoto, setEnviandoVoto] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('1'); // Votaciones por defecto
  const usuarioId =  usuario?.id;

  // Mapeo de rutas a keys del menú
  const routeToKey = {
    '/': '0',
    '/votaciones': '1',
    '/crear': '2',
    '/eventos': '3',
    '/dashboard': '5'
  };

  // Actualizar la key seleccionada basada en la ruta actual
  useEffect(() => {
    const currentKey = routeToKey[location.pathname] || '1';
    setSelectedKey(currentKey);
  }, [location.pathname]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [votacionRes, yaVotoRes] = await Promise.all([
          votacionService.obtenerVotacionPorId(id),
          votoService.verificarSiYaVoto(usuarioId, id)
        ]);
        
        setVotacion(votacionRes.data);
        setYaVoto(yaVotoRes.data.yaVoto);
      } catch (error) {
        message.error(`Error al cargar datos: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id]);

  const handleSubmit = async () => {
    if (!opcionSeleccionada) {
      message.warning('Debes seleccionar una opción antes de votar');
      return;
    }

    try {
      setEnviandoVoto(true);
      await votoService.emitirVoto(usuarioId, id, opcionSeleccionada);
      message.success('¡Voto emitido exitosamente!');
      setYaVoto(true);
    } catch (error) {
      message.error(`Error al emitir voto: ${error.message}`);
    } finally {
      setEnviandoVoto(false);
    }
  };

 
  const getEstadoTag = (estado) => {
    const estadoConfig = {
      'activa': { color: 'success', icon: <CheckCircleOutlined />, text: 'Activa' },
      'cerrada': { color: 'default', icon: <LockOutlined />, text: 'Cerrada' }
    };

    const config = estadoConfig[estado] || { color: 'default', icon: null, text: estado };
    
    return (
      <Tag color={config.color} icon={config.icon} style={{ fontSize: 14, padding: '4px 12px' }}>
        {config.text}
      </Tag>
    );
  };

  if (loading) {
    return (
     <MainLayout
    breadcrumb={
      <Breadcrumb style={{ margin: '14px 0' }}  />
    }
  >
          <Content style={{ padding: '48px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text style={{ color: '#64748b', fontSize: 16 }}>Cargando votación...</Text>
              </div>
            </div>
          </Content>
        </MainLayout>
    );
  }

  if (!votacion) {
    return (
      <MainLayout
    breadcrumb={
      <Breadcrumb style={{ margin: '14px 0' }}  />
    }
  >
          <Content style={{ padding: '48px 24px' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <Result
                status="404"
                title="Votación no encontrada"
                subTitle="La votación que buscas no existe o ha sido eliminada."
                extra={
                  <Button 
                    type="primary" 
                    onClick={() => navigate('/votaciones')}
                    style={{
                      backgroundColor: '#1e3a8a',
                      borderColor: '#1e3a8a',
                      borderRadius: 8,
                      height: 48,
                      paddingLeft: 24,
                      paddingRight: 24,
                      fontSize: 16,
                      fontWeight: 500
                    }}
                  >
                    Volver a Votaciones
                  </Button>
                }
              />
            </div>
          </Content>
       </MainLayout>
    );
  }

  return (
    <MainLayout
    breadcrumb={
      <Breadcrumb style={{ margin: '14px 0' }}  />
    }
  >
        <Content style={{ padding: '48px 24px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            
            {/* Botón volver */}
            <div style={{ marginBottom: 24 }}>
              <Button
                type="default"
                icon={<ArrowLeftOutlined />}
                style={{ 
                  borderRadius: 8,
                  height: 40,
                  paddingLeft: 16,
                  paddingRight: 20,
                  fontSize: 15,
                  fontWeight: 500,
                  borderColor: '#e2e8f0'
                }}
                onClick={() => navigate('/votaciones')}
              >
                Volver a Votaciones
              </Button>
            </div>
            
            {/* Header de la votación */}
            <Card
              style={{
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                marginBottom: 32,
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
              }}
              bodyStyle={{ padding: 32 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <Title level={2} style={{ color: '#1e3a8a', margin: 0, marginBottom: 8 }}>
                    {votacion.titulo}
                  </Title>
                  <Text style={{ color: '#64748b', fontSize: 16 }}>
                   
                  </Text>
                </div>
                {getEstadoTag(votacion.estado)}
              </div>
              
              {votacion.descripcion && (
                <Paragraph style={{ color: '#475569', fontSize: 16, marginBottom: 0, lineHeight: 1.6 }}>
                  {votacion.descripcion}
                </Paragraph>
              )}
            </Card>

            {/* Estado de la votación */}
            {votacion.estado !== 'activa' && (
              <Alert
                message="Votación no disponible"
                description={`Esta votación está ${votacion.estado} y no se pueden emitir votos.`}
                type="warning"
                icon={<LockOutlined />}
                style={{
                  borderRadius: 12,
                  marginBottom: 32,
                  border: '1px solid #fbbf24'
                }}
                showIcon
              />
            )}

            {/* Ya votó */}
            {yaVoto && (
              <Result
                icon={<CheckCircleOutlined style={{ color: '#10b981' }} />}
                title="¡Ya has votado!"
                subTitle="Tu voto ha sido registrado correctamente en esta votación. No puedes votar nuevamente."
                extra={[
                  <Button 
                    key="back"
                    size="large"
                    onClick={() => navigate('/votaciones')}
                    style={{
                      borderColor: '#1e3a8a',
                      color: '#1e3a8a',
                      borderRadius: 8,
                      height: 48,
                      paddingLeft: 24,
                      paddingRight: 24,
                      fontSize: 16,
                      fontWeight: 500
                    }}
                  >
                    Volver a Votaciones
                  </Button>,
                  <Button 
                    key="results"
                    type="primary"
                    size="large"
                    onClick={() => navigate(`/votacion/${id}/resultados`)}
                    style={{
                      backgroundColor: '#1e3a8a',
                      borderColor: '#1e3a8a',
                      borderRadius: 8,
                      height: 48,
                      paddingLeft: 24,
                      paddingRight: 24,
                      fontSize: 16,
                      fontWeight: 500
                    }}
                  >
                    Ver Resultados
                  </Button>
                ]}
              />
            )}

            {/* Formulario de votación */}
            {!yaVoto && votacion.estado === 'activa' && (
              <Card
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <SafetyOutlined style={{ marginRight: 8, color: '#1e3a8a' }} />
                    <span style={{ color: '#1e3a8a', fontWeight: 600 }}>Emite tu voto</span>
                  </div>
                }
                style={{
                  borderRadius: 12,
                  border: '1px solid #e2e8f0'
                }}
                bodyStyle={{ padding: 32 }}
              >
                <Alert
                  message="Información importante"
                  description="Tu voto es secreto y no podrá ser modificado una vez emitido. Asegúrate de seleccionar la opción correcta."
                  type="info"
                  icon={<InfoCircleOutlined />}
                  style={{
                    borderRadius: 8,
                    marginBottom: 32,
                    border: '1px solid #3b82f6'
                  }}
                  showIcon
                />

                <div style={{ marginBottom: 32 }}>
                  <Title level={4} style={{ color: '#1e3a8a', marginBottom: 24 }}>
                    Selecciona una opción:
                  </Title>
                  
                  <Radio.Group
                    value={opcionSeleccionada}
                    onChange={(e) => setOpcionSeleccionada(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      {votacion.opciones.map(opcion => (
                        <Card
                          key={opcion.id}
                          size="small"
                          hoverable
                          style={{
                            borderRadius: 8,
                            border: opcionSeleccionada === opcion.id ? '2px solid #1e3a8a' : '1px solid #e2e8f0',
                            backgroundColor: opcionSeleccionada === opcion.id ? '#f0f9ff' : 'white',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                          }}
                          bodyStyle={{ padding: 16 }}
                          onClick={() => setOpcionSeleccionada(opcion.id)}
                        >
                          <Radio value={opcion.id} style={{ fontSize: 16, fontWeight: 500 }}>
                            {opcion.textoOpcion}
                          </Radio>
                        </Card>
                      ))}
                    </Space>
                  </Radio.Group>
                </div>

                <Divider />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: '#64748b' }}>
                    <ClockCircleOutlined style={{ marginRight: 8 }} />
                    Asegúrate de tu elección antes de confirmar
                  </Text>
                  
                  <Button
                    type="primary"
                    size="large"
                    icon={<SendOutlined />}
                    loading={enviandoVoto}
                    disabled={!opcionSeleccionada}
                    onClick={handleSubmit}
                    style={{
                      backgroundColor: '#1e3a8a',
                      borderColor: '#1e3a8a',
                      borderRadius: 8,
                      height: 48,
                      paddingLeft: 24,
                      paddingRight: 24,
                      fontSize: 16,
                      fontWeight: 500
                    }}
                  >
                    {enviandoVoto ? 'Emitiendo Voto...' : 'Emitir Voto'}
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </Content>
      

      <style jsx>{`
        .ant-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .ant-radio-wrapper {
          display: flex;
          align-items: center;
          width: 100%;
        }
        
        .ant-radio {
          align-self: flex-start;
          margin-top: 2px;
        }
      `}</style>
    </MainLayout>
  );
}

export default Votar;