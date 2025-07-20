import React, { useEffect, useState } from "react";

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
} from 'antd';

import { PlusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function VerEventos() {
  const [eventos, setEventos] = useState([]);

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    obtenerEventos()
      .then(setEventos)
      .catch(() => messageApi.error('Error al obtener eventos. Inténtalo de nuevo más tarde.'));
  }, [messageApi]);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [confirmEditVisible, setConfirmEditVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [eventoAEliminar, setEventoAEliminar] = useState(null);

  const handleEditClick = (evento) => {
    setSelectedEvento(evento);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (id, titulo) => {
    setEventoAEliminar({ id, titulo });
    setConfirmDeleteVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!eventoAEliminar) return;
    try {
      await eliminarEvento(eventoAEliminar.id);
      messageApi.success('Evento eliminado exitosamente');
      setConfirmDeleteVisible(false);
      setEventoAEliminar(null);
      // Recargar eventos después de eliminar
      const nuevosEventos = await obtenerEventos();
      setEventos(nuevosEventos);
    } catch {
      messageApi.error('Error al eliminar el evento. Inténtalo de nuevo más tarde.');
      setConfirmDeleteVisible(false);
      setEventoAEliminar(null);
    }
  };

  const handleEditChange = (e) => {
    setSelectedEvento({ ...selectedEvento, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = () => {
    setConfirmEditVisible(true);
  };

  const handleConfirmEdit = async () => {
    // eslint-disable-next-line no-unused-vars
    const { id, estado, ...data } = selectedEvento;
    try {
      await modificarEvento(id, data);
      messageApi.success('Evento modificado exitosamente');
      setEditModalOpen(false);
      setSelectedEvento(null);
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
      <MainLayout breadcrumb={<Breadcrumb style={{ margin: '14px 0' }} />}>
      {contextHolder}
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
                  // Mostrar hora solo en formato HH:mm
                  let horaFormateada = e.hora ? e.hora.slice(0,5) : '';
                  return (
                    <Card key={e.id} size="small" title={e.titulo} extra={
                      <>
                        <a href="#" onClick={() => handleEditClick(e)} style={{ marginRight: 8}}>Modificar</a>
                        <a href="#" onClick={() => handleDeleteClick(e.id, e.titulo)} style={{color: 'red'}}>eliminar</a>
                      </>
                      }
                      style={{ width: 300, boxShadow: '5px 10px 15px rgba(0,0,0,0.1)', }}>
                        Fecha: {fechaFormateada} - Hora: {horaFormateada}  <br />
                        Descripción: {e.descripcion} <br />
                        Lugar: {e.lugar} <br />
                        Tipo: {e.tipo} <br />
                    </Card>
                  );
                })}
              </div>
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
                  <DatePicker style={{ width: '100%' }} onChange={(date) => setSelectedEvento({ ...selectedEvento, fecha: date ? date.format('YYYY-MM-DD') : '' })} />
                </Space.Compact>
                <Space.Compact block>
                  <TimePicker style={{ width: '100%' }} onChange={(time, timeString) => setSelectedEvento({ ...selectedEvento, hora: timeString })} format={"HH:mm"} />
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
        <Modal
          open={confirmDeleteVisible}
          title={`¿Estás seguro de eliminar el evento "${eventoAEliminar?.titulo ?? ''}"?`}
          onOk={handleConfirmDelete}
          onCancel={() => { setConfirmDeleteVisible(false); setEventoAEliminar(null); }}
          okText="Eliminar"
          cancelText="Cancelar"
        >
          <p>¡No podrás recuperar este evento!</p>
        </Modal>
      </MainLayout>
    </>
  );
}

export default VerEventos;