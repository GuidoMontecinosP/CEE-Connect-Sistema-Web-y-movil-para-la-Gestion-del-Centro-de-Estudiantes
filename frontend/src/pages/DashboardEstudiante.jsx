import { Card, Typography, Button } from 'antd';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export default function DashboardEstudiante() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10vh' }}>
      <Card style={{ width: 500 }}>
        <Title level={3}>Hola, {usuario?.nombre || 'Estudiante'}</Title>
        <Paragraph>Rol: <strong>{usuario?.rol}</strong></Paragraph>

        <Button type="primary" danger onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </Card>
    </div>
  );
}
