import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import dayjs from 'dayjs';

import { obtenerEventos, crearEvento, modificarEvento, eliminarEvento} from "../services/eventos.services.js";

import {
  DesktopOutlined,
  CarryOutOutlined,
  PieChartOutlined,
  HomeOutlined,
  CalendarOutlined,
  FileTextOutlined,AuditOutlined
} from '@ant-design/icons';
import { Breadcrumb, 
         Layout, 
         Menu, 
         theme, 
         Button, 
         Modal, 
         Input, 
         DatePicker, 
         Space, 
         TimePicker,
         Card
} from 'antd';

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
   getItem('Inicio', '0', <FileTextOutlined />),
  getItem('Votaciones', '1', <PieChartOutlined />),
  getItem('Crear Votacion', '2', <DesktopOutlined />),
  getItem('Eventos', '3', <CarryOutOutlined />),
 
  getItem('Dashboard', '5', <AuditOutlined />), // Si decides agregar un dashboard
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
    
    if (!registerData.fecha) {
      Swal.fire({
        title: '¡¡¡Falta la fecha!!!.',
        text: 'No se puede registrar un evento sin fecha.',
        icon: 'warning',
      })
      return;
    }
    if (!registerData.hora) {
      Swal.fire({
        title: '¡¡¡Falta la hora!!!.',
        text: 'No se puede registrar un evento sin hora.',
        icon: 'warning',
      })
      return;
    }
    try {
      await crearEvento(registerData);
      setLoading(true);

      Swal.fire({
        title: 'Evento registrado',
        text: 'El evento ha sido registrado correctamente.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => {
        setLoading(false);
        setOpen(false);
      }, 2000);

      // Recargar eventos después de crear uno nuevo
      const nuevosEventos = await obtenerEventos();
      setEventos(nuevosEventos);
      // alert('Evento registrado exitosamente');
      setRegisterData({
        titulo: '',
        descripcion: '',
        fecha: '',
        hora: '',
        lugar: '',
        tipo: ''
      });
    } catch (err) {
      Swal.fire({
        title: 'Error al registrar el evento',
        text: err.message || 'Hubo un problema al registrar el evento.',
        icon: 'error',
      });
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
      navigate('/noticias');
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
    if (item.key === '5') {
      navigate('/dashboard');
    }
  };

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState(null);

  const handleEditClick = (evento) => {
    setSelectedEvento(evento);
    setEditModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás recuperar este evento!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        eliminarEvento(id)
          .then(async () => {
            Swal.fire('¡Eliminado!', 'El evento ha sido eliminado.', 'success');
            // Recargar eventos después de eliminar
            const nuevosEventos = await obtenerEventos();
            setEventos(nuevosEventos);
          })
          .catch(() => {
            Swal.fire('Error', 'Hubo un problema al eliminar el evento.', 'error');
          });
      }
    });
  };
  const handleEditChange = (e) => {
    setSelectedEvento({ ...selectedEvento, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    Swal.fire({
      title: '¿Estás seguro de modificar este evento?',
      text: "¡Los cambios serán permanentes!",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, modificar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed){
        modificarEvento(selectedEvento)
          .then(async () => {
            Swal.fire('¡Modificado!', 'El evento ha sido modificado.', 'success');
            setEditModalOpen(false);
            setSelectedEvento(null);
            const nuevosEventos = await obtenerEventos();
            setEventos(nuevosEventos);
          })
          .catch(() => {
            Swal.fire('Error', 'Hubo un problema al modificar el evento.', 'error');
          })
      }
    })
  };

  return (
    <>
     <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
          <div className="demo-logo-vertical" />
          <Menu theme="dark" defaultSelectedKeys={['3']} mode="inline" items={items} onClick={onMenuClick} />
        </Sider>
        <Layout>
            <Content style={{ margin: '0 16px' }}>
              <Breadcrumb style={{ margin: '14px 0' }} items={[{ title: 'Gestion de Eventos' }]} />
              <div
                style={{
                  padding: 22,
                  minHeight: 360,
                  background: colorBgContainer,
                  borderRadius: borderRadiusLG,
                }}
              >
                <h1>Eventos Proximos</h1>
              <Button onClick={showModal}>Ingresar Nuevo Evento</Button>
              {eventos.length === 0 ? (
                <p>No hay eventos registrados.</p>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  flexWrap: 'wrap',
                  gap: 30,
                  marginTop: 24,
                  marginLeft: '20px',
                  
                }}>
                  {eventos.map(e => {
                    // Formatear fecha de YYYY-MM-DD a DD-MM-YYYY
                    let fechaFormateada = e.fecha ? e.fecha.split('-').reverse().join('-') : '';
                    return (
                      <Card key={e.id} size="small" title={e.titulo} extra={
                        <>
                        <a href="#" onClick={() => handleEditClick(e)} style={{ marginRight: 8}}>Modificar</a>
                        <a href="#" onClick={() => handleDeleteClick(e.id)} style={{color: 'red'}}>eliminar</a>
                        </>
                      }
                      style={{ width: 300, boxShadow: '5px 10px 15px rgba(0,0,0,0.1)', }}>
                        Fecha: {fechaFormateada} - Hora: {e.hora ?? ''}  <br />
                        Descripción: {e.descripcion} <br />
                        Lugar: {e.lugar} <br />
                        Tipo: {e.tipo} <br />
                      </Card>
                    );
                  })}
                </div>
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
              <Space.Compact block>
                {/* <Input type="date"  placeholder="Fecha" name="fecha" value={registerData.fecha} onChange={handleRegisterChange} required /> */}
                <DatePicker 
                style={{ width: '100%' }} 
                value={registerData.fecha ? dayjs(registerData.fecha, 'YYYY-MM-DD') : null}
                onChange={(date) => setRegisterData({ ...registerData, fecha: date ? date.format('YYYY-MM-DD') : '' })} />
              </Space.Compact>
              <Space.Compact block>
                {/* <Input type="time"  placeholder="Hora" name="hora" value={registerData.hora} onChange={handleRegisterChange} required /> */}
                <TimePicker
                  style={{ width: '100%' }}
                  value={registerData.hora ? dayjs(registerData.hora, 'HH:mm:ss') : null}
                  onChange={(time, timeString) => setRegisterData({ ...registerData, hora: timeString })}
                  format="HH:mm:ss"
                  placeholder="Selecciona la hora"
                />
              </Space.Compact>
              
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
        {/* Modal para Modificar */}
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
                <Space.Compact block>
                  <DatePicker style={{ width: '100%' }} onChange={(date) => setSelectedEvento({ ...selectedEvento, fecha: date ? date.format('YYYY-MM-DD') : '' })} />
                </Space.Compact>
                <Space.Compact block>
                  <TimePicker style={{ width: '100%' }} onChange={(time, timeString) => setSelectedEvento({ ...selectedEvento, hora: timeString })} />
                </Space.Compact>
                {/* <Input type="date" placeholder="Fecha" name="fecha" value={selectedEvento.fecha} onChange={handleEditChange} required />
                <Input type="time" placeholder="Hora" name="hora" value={selectedEvento.hora} onChange={handleEditChange} required /> */}
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