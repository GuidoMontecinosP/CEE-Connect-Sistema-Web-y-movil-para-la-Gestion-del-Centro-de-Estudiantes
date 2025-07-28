import React, { useEffect, useState } from "react";
import dayjs from 'dayjs';

import MainLayout from "../components/MainLayout.jsx";

import { obtenerEventos, modificarEvento, eliminarEvento} from "../services/eventos.services.js";

import { Breadcrumb, 
         Button, 
         Modal, 
         Input, 
         DatePicker, 
         Space, 
         TimePicker,
         Card,
         Typography,
         message,
         Select,
         Spin,     
} from 'antd';

import { MdEvent, MdDescription, MdPlace, MdLabel } from 'react-icons/md'

import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function VerEventos() {
  const [eventos, setEventos] = useState([]);

  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();
  const [loading, setLoading] = useState(true);

  const fetchEventos = async () => {
      setLoading(true);
      try {
        const data = await obtenerEventos();
        setEventos(Array.isArray(data) ? data : []);
      } catch {
        messageApi.error('Error al obtener anuncios');
      }
      setLoading(false);
    };

  useEffect(() => {
    fetchEventos(); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const [imagen, setNuevaImagen] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [confirmEditVisible, setConfirmEditVisible] = useState(false);

  const handleEditClick = (evento) => {
    setSelectedEvento(evento);
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    setSelectedEvento({ ...selectedEvento, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = () => {
    setConfirmEditVisible(true);
  };

  const handleDelete = (e) => {
    modal.confirm({
      title: `¿Seguro de eliminar el evento "${e.titulo}"?`,
      icon: <ExclamationCircleOutlined />,
      content: 'Esta acción no se podra deshacer.',
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      async onOk() {
        await eliminarEvento(e.id);
        fetchEventos();
        messageApi.success('Evento eliminado');
      },
    });
  };

  const handleConfirmEdit = async () => {
    // eslint-disable-next-line no-unused-vars
    const { id, estado, ...data } = selectedEvento;
    try {
      // Asegurar formato HH:mm
      let hora = data.hora;
      if (!hora && selectedEvento.hora) {
        hora = selectedEvento.hora;
      }
      if (hora && typeof hora === 'object' && hora.format) {
        hora = hora.format('HH:mm');
      }
      if (hora && typeof hora === 'string' && hora.length > 5) {
        // Si por error viene con segundos, recortar
        hora = hora.slice(0,5);
      }
      const formData = new FormData();
      for (const key in data) {
        if (key === 'hora') {
          formData.append('hora', hora || '');
        } else {
          formData.append(key, data[key]);
        }
      }
      if (imagen) {
        formData.append('imagen', imagen);
      }
      await modificarEvento(id, formData);
      messageApi.success('Evento modificado exitosamente');
      setEditModalOpen(false);
      setSelectedEvento(null);
      setNuevaImagen(null);
      setConfirmEditVisible(false);
      // Recargar eventos después de modificar
      const nuevosEventos = await obtenerEventos();
      setEventos(nuevosEventos);
    } catch (error) {
      const mensaje = error.response?.data?.message || 'Error inesperado al modificar el evento.';
      messageApi.error(mensaje);
      setConfirmEditVisible(false);
    }
  };

  return (
    <>     
      <MainLayout breadcrumb>
      {contextHolder}
      {modalContextHolder}
        <div >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
          <div>
            <Title level={1} style={{ color: '#1e3a8a', marginBottom: 8 }}>
              Listado de Eventos
             
            </Title>
            <Text style={{ fontSize: 16, color: '#64748b' }}>
              Aquí puedes ver, registrar, modificar y eliminar eventos.
            </Text>
          </div>
          
          <Button  type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => window.location.href = '/crearEvento'}
            style={{
                backgroundColor: '#1e3a8a',
                borderColor: '#1e3a8a',
                borderRadius: 8,
                height: 48,
                paddingLeft: 24,
                paddingRight: 24,
                fontSize: 16,
                fontWeight: 500
              }}>
                Ingresar Nuevo Evento
            </Button>
          </div>
            {loading ? (
              <div style={{ textAlign: 'center', marginTop: 40 }}>
                <Spin size="large" />
              </div>
            ) : (
              eventos.length === 0 ? (
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
                    // Mostrar hora solo en formato HH:mm
                    let horaFormateada = e.hora ? e.hora.slice(0,5) : '';
                    return (
                      <Card key={e.id} size="small" title={e.titulo} extra={
                        <>
                          <a><Button size="small" wuarning onClick={() => handleEditClick(e)}>Editar</Button> </a>
                          <a><Button size="small" danger onClick={() => handleDelete(e)}>Eliminar</Button></a>
                        </>
                        }
                        style={{ width: 300, boxShadow: '5px 10px 15px rgba(0,0,0,0.1)', }}>
                        {e.imagen ? (
                          <img
                            src={`http://146.83.198.35:1217${e.imagen}`}
                            alt={e.titulo}
                            style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                          />
                        ) : (
                            <div
                              style={{
                                width: '100%',
                                height: 140,
                                background: '#f0f0f0',
                                borderRadius: 8,
                                marginBottom: 8,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#aaa',
                                fontSize: 16,
                                fontStyle: 'italic'
                              }}
                            >
                              Sin imagen
                            </div>
                        )}
                        <MdEvent/> Fecha: {fechaFormateada} - Hora: {horaFormateada}  <br />
                        <MdDescription/> Descripción: {e.descripcion} <br />
                        <MdPlace/> Lugar: {e.lugar} <br />
                        <MdLabel/> Tipo: {e.tipo} <br />
                      </Card>
                    );
                  })}
                </div>
              )
            )}
        </div>
      
        {/* Modal para Modificar */}
        <Modal
          open={editModalOpen}
          title="Modificar Evento"
          onCancel={() => setEditModalOpen(false)}
          footer={null}
        >
          {selectedEvento && (
            <div>
              <div>
                <Input type="text" placeholder="Título" name="titulo" value={selectedEvento.titulo} onChange={handleEditChange} />
                <Input type="text" placeholder="Descripción" name="descripcion" value={selectedEvento.descripcion} onChange={handleEditChange}/>
                <Space.Compact block>
                  <DatePicker
                    style={{ width: '100%' }}
                    value={selectedEvento.fecha ? dayjs(selectedEvento.fecha, 'YYYY-MM-DD') : null}
                    onChange={date => setSelectedEvento({ ...selectedEvento, fecha: date ? date.format('YYYY-MM-DD') : '' })}
                  />
                </Space.Compact>
                <Space.Compact block>
                  <TimePicker
                    style={{ width: '100%' }}
                    value={selectedEvento.hora ? dayjs(selectedEvento.hora, 'HH:mm') : null}
                    onChange={(time, timeString) => setSelectedEvento({ ...selectedEvento, hora: timeString })}
                    format={"HH:mm"}
                  />
                </Space.Compact>
                {/* <Input type="date" placeholder="Fecha" name="fecha" value={selectedEvento.fecha} onChange={handleEditChange} required />
                <Input type="time" placeholder="Hora" name="hora" value={selectedEvento.hora} onChange={handleEditChange} required /> */}
                <Input type="text" placeholder="Lugar" name="lugar" value={selectedEvento.lugar} onChange={handleEditChange} />
                <Select
                  placeholder="Tipo de evento"
                  name="tipo"
                  value={selectedEvento.tipo}
                  style={{ width: '100%', marginTop: 8 }}
                  onChange={value => setSelectedEvento({ ...selectedEvento, tipo: value })}
                  options={[
                    { value: 'Charla', label: 'Charla' },
                    { value: 'Taller', label: 'Taller' },
                    { value: 'Conferencia', label: 'Conferencia' },
                    { value: 'Reunión', label: 'Reunión' },
                    { value: 'Recreativo', label: 'Recreativo' },
                    { value: 'Otro', label: 'Otro' },
                  ]}
                />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNuevaImagen(e.target.files[0])}
                  style={{ marginTop: 8 }}
                />
                <Text style={{ fontSize: 12, color: '#888' }}>
                  Si no seleccionas una nueva imagen, se mantendrá la actual.
                </Text>
              </div>
              <div style={{ marginTop: 16, textAlign: 'right' }}>
                <Button onClick={() => setEditModalOpen(false)} style={{ marginRight: 8 }}>
                  Cancelar
                </Button>
                <Button type="primary" onClick={handleEditSubmit}>
                  Guardar Cambios
                </Button>
              </div>
            </div>
          )}
        </Modal>
        <Modal
          open={confirmEditVisible}
          title="¿Estás seguro de que deseas modificar este evento?"
          onOk={handleConfirmEdit}
          onCancel={() => setConfirmEditVisible(false)}
          okText="Modificar"
          cancelText="Cancelar"
        >
          <p>Recuerda que una vez modificado, no podrás revertir los cambios.</p>
        </Modal>
      </MainLayout>
    </>
  );
}

export default VerEventos;