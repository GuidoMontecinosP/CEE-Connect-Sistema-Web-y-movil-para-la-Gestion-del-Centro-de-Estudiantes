import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

import { obtenerEventos, crearEvento, modificarEvento} from "../services/eventos.services.js";

import {
  DesktopOutlined,
  CarryOutOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
  HomeOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme, Button, Modal, Input } from 'antd';

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

const items = [
  getItem('Home', '0', <HomeOutlined /> ),
  getItem('Votaciones', '1', <PieChartOutlined />),
  getItem('Crear Votacion', '2', <DesktopOutlined />),
  getItem('Eventos', '3', <CarryOutOutlined />),
];


function VerEventos() {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [registerData, setRegisterData] = useState({
        titulo: '',
        descripcion: '',
        fecha: '',
        hora: '',
        lugar: '',
        tipo: ''
    });


  useEffect(() => {
    obtenerEventos()
      .then(res => setEventos(res))
      .catch(err => alert(err.message));
  }, []);

   const handleRegisterChange = (e) => {
        setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    };
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      await crearEvento(registerData);
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setOpen(false);
      }, 3000);

      // Recargar eventos después de crear uno nuevo
      const nuevosEventos = await obtenerEventos();
      setEventos(nuevosEventos);
      alert('Evento registrado exitosamente');
      setRegisterData({
        titulo: '',
        descripcion: '',
        fecha: '',
        hora: '',
        lugar: '',
        tipo: ''
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const showModal = () => {
    setOpen(true);
  };
  const handleCancel = () => {
    setOpen(false);
  };

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

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState(null);

  const handleEditClick = (evento) => {
    setSelectedEvento(evento);
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    setSelectedEvento({ ...selectedEvento, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await modificarEvento(selectedEvento);
      alert('Evento modificado exitosamente');
      setEditModalOpen(false);
      setSelectedEvento(null);
      // Recargar eventos después de modificar
      const nuevosEventos = await obtenerEventos();
      setEventos(nuevosEventos);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
     <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
          <div className="demo-logo-vertical" />
          <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} onClick={onMenuClick} />
        </Sider>
        <Layout>
          <Header style={{ padding: 0, background: colorBgContainer }} />
            <Content style={{ margin: '0 16px' }}>
              <Breadcrumb style={{ margin: '16px 0' }} items={[{ title: 'Eventos' }]} />
              <div
                style={{
                  padding: 24,
                  minHeight: 360,
                  background: colorBgContainer,
                  borderRadius: borderRadiusLG,
                }}
              >
                <h1>Listado de Eventos</h1>
            <Button onClick={showModal}>Ingresar Nuevo Evento</Button>
            {eventos.length === 0 ? (
                <p>No hay eventos registrados.</p>
            ) : (
                <ul>
                {eventos.map(e => (
                    <li key={e.id}>
                    <strong>{e.titulo}</strong> - Fecha: {e.fecha ? new Date(e.fecha).toLocaleDateString() : ''} - Hora: {e.hora ?? ''}  <br />
                    Descripción: {e.descripcion} <br />
                    Lugar: {e.lugar} <br />
                    Tipo: {e.tipo} <br />
                    <Button onClick={() => handleEditClick(e)} style={{backgroundColor:'#191970', color:'#fff'}}>Modificar</Button>
                    </li>
                ))}
                </ul>
            )}
              </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>
              ¡¡¡Created by Team Guido!!!
            </Footer>
          </Layout>
          
        <Modal 
          open={open}
          title="Registrar un Nuevo Evento"
          onCancel={handleCancel}
          footer={null}
        >
          <form onSubmit={handleRegisterSubmit}>
            <div >
              <Input type="text"  placeholder="Título" name="titulo" value={registerData.titulo} onChange={handleRegisterChange} required />
              <Input type="text"  placeholder="Descripción" name="descripcion" value={registerData.descripcion} onChange={handleRegisterChange} required />
              <Input type="date"  placeholder="Fecha" name="fecha" value={registerData.fecha} onChange={handleRegisterChange} required />
              <Input type="time"  placeholder="Hora" name="hora" value={registerData.hora} onChange={handleRegisterChange} required />
              <Input type="text"  placeholder="Lugar" name="lugar" value={registerData.lugar} onChange={handleRegisterChange} required />
              <Input type="text"  placeholder="Tipo" name="tipo" value={registerData.tipo} onChange={handleRegisterChange} required />
            </div>
            <div  style={{ marginTop: 16, textAlign: 'right' }}>
              <Button  onClick={handleCancel} style={{ marginRight: 8 }}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} >
                Registrar
              </Button>
            </div>
          </form>
        </Modal> 

        <Modal
          open={editModalOpen}
          title="Modificar Evento"
          onCancel={() => setEditModalOpen(false)}
          footer={null}
        >
          {selectedEvento && (
            <form onSubmit={handleEditSubmit}>
              <div>
                <Input type="text" placeholder="Título" name="titulo" value={selectedEvento.titulo} onChange={handleEditChange} required />
                <Input type="text" placeholder="Descripción" name="descripcion" value={selectedEvento.descripcion} onChange={handleEditChange} required />
                <Input type="date" placeholder="Fecha" name="fecha" value={selectedEvento.fecha} onChange={handleEditChange} required />
                <Input type="time" placeholder="Hora" name="hora" value={selectedEvento.hora} onChange={handleEditChange} required />
                <Input type="text" placeholder="Lugar" name="lugar" value={selectedEvento.lugar} onChange={handleEditChange} required />
                <Input type="text" placeholder="Tipo" name="tipo" value={selectedEvento.tipo} onChange={handleEditChange} required />
              </div>
              <div style={{ marginTop: 16, textAlign: 'right' }}>
                <Button onClick={() => setEditModalOpen(false)} style={{ marginRight: 8 }}>
                  Cancelar
                </Button>
                <Button type="primary" htmlType="submit">
                  Guardar Cambios
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </Layout>
    </>
  );
}

export default VerEventos;