import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <Result
      status="403"
      title="403 - Acceso no autorizado"
      subTitle="No tienes permisos para ver esta página."
      extra={<Button type="primary" onClick={() => navigate('/login')}>Volver al login</Button>}
    />
  );
}
