import React, { useEffect, useState } from "react";
import Swal from 'sweetalert2';

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
         Typography      
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function VerEventos() {
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    obtenerEventos()
      .then(setEventos)
      .catch(() => Swal.fire('Error', 'Hubo un problema al cargar los eventos.', 'error'));
  }, []);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState(null);

  const handleEditClick = (evento) => {
    setSelectedEvento(evento);
    setEditModalOpen(true);
  };

  const handleDeleteClick = async (id, titulo) => {
    Swal.fire({
      title: `¿Estás seguro de eliminar el evento "${titulo}"?`,
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
        // Excluir el campo id antes de enviar al backend
        // eslint-disable-next-line no-unused-vars
        const { id, estado, ...eventoSinId } = selectedEvento;
        modificarEvento(id, eventoSinId)
          .then(async () => {
            Swal.fire('¡Modificado!', 'El evento ha sido modificado.', 'success');
            setEditModalOpen(false);
            setSelectedEvento(null);
            const nuevosEventos = await obtenerEventos();
            setEventos(nuevosEventos);
          })
          .catch((error) => {

            const errores = error.response?.data?.errors;
            const mensaje = error.response?.data?.message || 'Error inesperado en la modificación del evento.';

            if(Array.isArray(errores)) {
              Swal.fire({
                icon: 'error',
                title: 'Error de validación',
                html: `<ul style="text-align: left;">${errores.map(e => `<li>${e}</li>`).join('')}</ul>`,
              })
            } else{
              Swal.fire('Error', mensaje, 'error');
            }
          })
      }
    })
  };
  return (
    <>     
      <MainLayout breadcrumb={<Breadcrumb style={{ margin: '14px 0' }} />}>
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
            <form onSubmit={handleEditSubmit}>
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
                <Input type="text" placeholder="Tipo" name="tipo" value={selectedEvento.tipo} onChange={handleEditChange} />
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
      </MainLayout>
    </>
  );
}

export default VerEventos;