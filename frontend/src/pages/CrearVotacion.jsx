import { useState } from 'react';
import { votacionService } from '../services/votacion.services';

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


function CrearVotacion() {
  const [titulo, setTitulo] = useState('');
  const [opciones, setOpciones] = useState(['', '']); // Comienza con 2 opciones mínimas

  const handleOpcionChange = (index, value) => {
    const nuevasOpciones = [...opciones];
    nuevasOpciones[index] = value;
    setOpciones(nuevasOpciones);
  };

  const agregarOpcion = () => {
    if (opciones.length < 10) {
      setOpciones([...opciones, '']);
    }
  };

  const eliminarOpcion = (index) => {
    if (opciones.length > 2) {
      const nuevasOpciones = opciones.filter((_, i) => i !== index);
      setOpciones(nuevasOpciones);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const opcionesValidas = opciones.filter(op => op.trim() !== '');
    if (opcionesValidas.length < 2) {
      return alert('Debes ingresar al menos 2 opciones válidas');
    }

    try {
      await votacionService.crearVotacion(titulo, opcionesValidas);
      alert('Votación creada exitosamente');
      setTitulo('');
      setOpciones(['', '']);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

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
                <Menu theme="dark" defaultSelectedKeys={['2']} mode="inline" items={items} onClick={onMenuClick} />
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
                <h1>Crear Nueva Votacion!</h1>
              </div>
          <form onSubmit={handleSubmit}>
      <h1>Crear Nueva Votación</h1>

      <input
        type="text"
        placeholder="Título de la votación"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        required
      />
      <br /><br />

      <h3>Opciones:</h3>
      {opciones.map((opcion, index) => (
        <div key={index}>
          <input
            type="text"
            placeholder={`Opción ${index + 1}`}
            value={opcion}
            onChange={(e) => handleOpcionChange(index, e.target.value)}
            required
          />
          {opciones.length > 2 && (
            <button type="button" onClick={() => eliminarOpcion(index)}>X</button>
          )}
        </div>
      ))}

      {opciones.length < 10 && (
        <button type="button" onClick={agregarOpcion}>+ Agregar opción</button>
      )}
      <br /><br />

      <button type="submit">Crear Votación</button>
    </form>
    </Content>
              <Footer style={{ textAlign: 'center' }}>
                ¡¡¡Created by Team Guido!!!
              </Footer>
            </Layout>
          </Layout>
  );
}

export default CrearVotacion;
