import React from 'react';
import { Layout, Menu, Card, Row, Col, Typography, Button } from 'antd';
import { CheckCircleOutlined, PlusOutlined, HomeOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

function MenuPrincipal() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const handleMenuClick = (e) => {
    switch (e.key) {
      case 'home':
        navigate('/');
        break;
      case 'listar':
        navigate('/votaciones');
        break;
      case 'crear':
        navigate('/crear');
        break;
      default:
        console.log('Ruta no definida para:', e.key);
    }
  };

  // Estructura del menú con opciones dinámicas según el rol
  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: 'Inicio',
    },
    {
      key: 'votaciones',
      icon: <CheckCircleOutlined />,
      label: 'Votaciones',
      children: [
        { key: 'listar', label: 'Listar Votaciones' },
        ...(usuario?.rol === 'administrador'
          ? [{ key: 'crear', label: 'Crear Votación' }] // Solo administrador puede ver la opción de crear votación
          : []),
      ],
    },
  ];

  const cardData = [
    {
      title: 'Listado de Votaciones',
      description: 'Consulta y gestiona todas las votaciones existentes',
      icon: <CheckCircleOutlined style={{ fontSize: 48, color: '#1e3a8a' }} />,
      link: '/votaciones',
      buttonText: 'Ver Votaciones',
    },
  ];

  // Agregar la opción de crear votación si el usuario es administrador
  if (usuario?.rol === 'administrador') {
    cardData.push({
      title: 'Crear Nueva Votación',
      description: 'Configura y crea una nueva sesión de votación',
      icon: <PlusOutlined style={{ fontSize: 48, color: '#1e3a8a' }} />,
      link: '/crear',
      buttonText: 'Crear Votación',
    });
  }

  return (
    <div>
      <h1>Menú Principal</h1>
      <ul>
        <li><Link to="/votaciones"> Listado de Votaciones</Link></li>
        <li><Link to="/crear">Crear Nueva Votación</Link></li>
        <li><Link to="/eventos">Proximo Eventos</Link></li>
      </ul>
    </div>
  );
}

export default MenuPrincipal;