import { useEffect, useState } from 'react';
import { Button, Card, Input, Modal, Space, Table, Typography, message, Select } from 'antd';
import MainLayout from '../components/MainLayout.jsx';
import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { obtenerAnuncios, crearAnuncio, modificarAnuncio, eliminarAnuncio } from '../services/anuncios.services.js';

const { Title, Text } = Typography;

function AdminAnuncios() {
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [anuncioEdit, setAnuncioEdit] = useState(null);
  const [form, setForm] = useState({ titulo: '', epilogo: '', link: '', tipo: 'avisos importantes' });
  const [imagen, setImagen] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();


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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setForm({ titulo: '', epilogo: '', link: '', tipo: '' });
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
      let dataToSend = form;
      // Si hay imagen, usar FormData
      if (imagen) {
        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
          formData.append(key, value);
        });
        formData.append('imagen', imagen);
        dataToSend = formData;
      }
      if (editMode && anuncioEdit) {
        await modificarAnuncio(anuncioEdit.id, dataToSend, !!imagen);
        messageApi.success('Anuncio modificado');
      } else {
        await crearAnuncio(dataToSend, !!imagen);
        messageApi.success('Anuncio creado');
      }
      fetchAnuncios();
      handleCloseModal();
      setImagen(null);
    } catch (e) {
      console.log(e);
      messageApi.error(e.message || 'Error al guardar el anuncio');
    }
  };

  const handleDelete = (id) => {
    modal.confirm({
      title: '¿Eliminar anuncio?',
      icon: <ExclamationCircleOutlined />,
      content: 'Esta acción no se puede deshacer.',
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      async onOk() {
        await eliminarAnuncio(id);
        fetchAnuncios();
        messageApi.success('Anuncio eliminado');
      },
    });
  };

  const columns = [
    {
      title: 'Imagen',
      dataIndex: 'imagen',
      key: 'imagen',
      render: img =>
        img ? (
          <img
            src={`http://146.83.198.35:1217${img}`}
            alt="anuncio"
            style={{ width: 100, height: 80, objectFit: 'cover', borderRadius: 4, border: '1px solid #eee' }}
          />
        ) : (
          <span style={{ color: '#aaa', fontStyle: 'italic', fontSize: 12 }}>Sin imagen</span>
        ),
    },
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
    <MainLayout breadcrumb>
      {contextHolder}
      {modalContextHolder}
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
          <div>
            <Title level={1} style={{ color: '#1e3a8a', marginBottom: 8 }}>Administrar Anuncios del CEE</Title>
            <Text style={{ fontSize: 16, color: '#64748b', marginBottom: 24 }}>
              Aquí puedes crear, editar o eliminar anuncios que serán visibles para todos los usuarios.
            </Text>
          </div>
          <Button type="primary" 
            size="large"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
            style={{ 
              backgroundColor: '#1e3a8a',
              borderColor: '#1e3a8a',
              borderRadius: 8,
              height: 48,
              paddingLeft: 24,
              paddingRight: 24,
              fontSize: 16,
              fontWeight: 500 
              }} >
              Nuevo Anuncio
          </Button>
        </div>
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
          <Input
            type="file"
            accept="image/*"
            style={{ marginTop: 12 }}
            onChange={e => setImagen(e.target.files[0])}
          />
          <Text style={{ fontSize: 12, color: '#888' }}>
            Imagen opcional. Si no seleccionas una imagen, el anuncio no tendrá imagen.
          </Text>
        </Modal>
      </div>
    </MainLayout>
  );
}

export default AdminAnuncios;
