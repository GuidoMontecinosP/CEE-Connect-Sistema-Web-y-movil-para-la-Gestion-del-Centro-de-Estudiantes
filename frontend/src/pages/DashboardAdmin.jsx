import { Card, Typography, Button, Breadcrumb } from 'antd';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  HomeOutlined,BarChartOutlined,
  PieChartOutlined,
  DesktopOutlined,
  CarryOutOutlined,
  FileTextOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import MainLayout from '../components/MainLayout.jsx';


const { Title, Paragraph } = Typography;

export default function DashboardEstudiante() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  
  //console.log("📊 Usuario en Dashboard:", usuario);

 

  return (
    <MainLayout breadcrumb={<Breadcrumb style={{ margin: '14px 0' }} items={[{ title: 'Dashboard' }]} /> }>
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
                  {usuario?.nombre }
                </Title>
                <Paragraph style={{ fontSize: 16, color: '#64748b', marginBottom: 0 }}>
                  Rol: <strong style={{ color: '#1e3a8a' }}>{usuario?.rol?.nombre}</strong>
                </Paragraph>
                <Paragraph style={{ fontSize: 16, color: '#64748b', marginBottom: 0 }}>
                  Correo: <strong style={{ color: '#1e3a8a' }}>{usuario?.correo}</strong>
                </Paragraph>
              </div>

              {/* Información adicional para estudiantes */}
              {usuario?.rol?.nombre === 'estudiante' && (
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
              {usuario?.rol?.nombre === 'administrador' && (
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
                     <strong>Panel de Administrador:</strong>
                  </Paragraph>
                  <ul style={{ color: '#a16207', fontSize: 14, marginBottom: 0, paddingLeft: 20 }}>
                    <li>Crear y gestionar votaciones</li>
                    <li>Administrar eventos</li>
                    <li>Acceso a todas las funcionalidades</li>
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
    </MainLayout>
  );
}
