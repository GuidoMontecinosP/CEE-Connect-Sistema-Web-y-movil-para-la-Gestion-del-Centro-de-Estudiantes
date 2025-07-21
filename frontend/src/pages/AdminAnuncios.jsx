import { useEffect, useState } from 'react';
import { Button, Card, Input, Modal, Space, Table, Typography, message, Select } from 'antd';
import MainLayout from '../components/MainLayout.jsx';
import { obtenerAnuncios, crearAnuncio, modificarAnuncio, eliminarAnuncio } from '../services/anuncios.services.js';

const { Title } = Typography;

function AdminAnuncios() {
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [anuncioEdit, setAnuncioEdit] = useState(null);
  const [form, setForm] = useState({ titulo: '', epilogo: '', link: '', tipo: 'avisos importantes' });
  const [messageApi, contextHolder] = message.useMessage();

  const fetchAnuncios = async () => {
    setLoading(true);
    try {
      const data = await obtenerAnuncios();
      setAnuncios(Array.isArray(data) ? data : []);
    } catch {
      messageApi.error('Error al obtener anuncios');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnuncios();
  }, []);

  const handleOpenModal = (anuncio = null) => {
    setEditMode(!!anuncio);
    setAnuncioEdit(anuncio);
    setForm(anuncio ? { ...anuncio } : { titulo: '', epilogo: '', link: '', tipo: 'avisos importantes' });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setAnuncioEdit(null);
    setForm({ titulo: '', epilogo: '', link: '', tipo: 'avisos importantes' });
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleTipoChange = value => {
    setForm(prev => ({ ...prev, tipo: value }));
  };

  const handleSubmit = async () => {
    try {
      if (editMode && anuncioEdit) {
        await modificarAnuncio(anuncioEdit.id, form);
        messageApi.success('Anuncio modificado');
      } else {
        await crearAnuncio(form);
        messageApi.success('Anuncio creado');
      }
      fetchAnuncios();
      handleCloseModal();
    } catch (e) {
      messageApi.error(e.message || 'Error al guardar el anuncio');
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: '¿Eliminar anuncio?',
      content: 'Esta acción no se puede deshacer.',
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await eliminarAnuncio(id);
          messageApi.success('Anuncio eliminado');
          fetchAnuncios();
        } catch (e) {
          messageApi.error(e.message || 'Error al eliminar');
        }
      }
    });
  };

  const columns = [
    { title: 'Título', dataIndex: 'titulo', key: 'titulo' },
    { title: 'Epílogo', dataIndex: 'epilogo', key: 'epilogo' },
    { title: 'Tipo', dataIndex: 'tipo', key: 'tipo' },
    { title: 'Link', dataIndex: 'link', key: 'link', render: l => l ? <a href={l} target="_blank" rel="noopener noreferrer">Enlace</a> : '-' },
    { title: 'Acciones', key: 'acciones', render: (_, record) => (
      <Space>
        <Button size="small" onClick={() => handleOpenModal(record)}>Editar</Button>
        <Button size="small" danger onClick={() => handleDelete(record.id)}>Eliminar</Button>
      </Space>
    ) },
  ];

  return (
    <MainLayout breadcrumb={null}>
      {contextHolder}
      <div style={{ padding: 24 }}>
        <Title level={2} style={{ marginBottom: 24 }}>Administrar Anuncios del CEE</Title>
        <Button type="primary" style={{ marginBottom: 16 }} onClick={() => handleOpenModal()}>Nuevo Anuncio</Button>
        <Table columns={columns} dataSource={anuncios} rowKey="id" loading={loading} pagination={false} />
        <Modal
          open={modalOpen}
          title={editMode ? 'Editar Anuncio' : 'Nuevo Anuncio'}
          onCancel={handleCloseModal}
          onOk={handleSubmit}
          okText={editMode ? 'Guardar Cambios' : 'Crear'}
        >
          <Input style={{ marginBottom: 12 }} name="titulo" value={form.titulo} onChange={handleChange} placeholder="Título" />
          <Input.TextArea style={{ marginBottom: 12 }} name="epilogo" value={form.epilogo} onChange={handleChange} placeholder="Epílogo" rows={3} />
          <Input style={{ marginBottom: 12 }} name="link" value={form.link} onChange={handleChange} placeholder="Enlace (opcional)" />
          <Select
            style={{ width: '100%' }}
            value={form.tipo}
            onChange={handleTipoChange}
            options={[
              { value: 'urgente', label: 'Urgente' },
              { value: 'avisos importantes', label: 'Avisos importantes' },
              { value: 'otro', label: 'Otro' },
            ]}
          />
        </Modal>
      </div>
    </MainLayout>
  );
}

export default AdminAnuncios;
