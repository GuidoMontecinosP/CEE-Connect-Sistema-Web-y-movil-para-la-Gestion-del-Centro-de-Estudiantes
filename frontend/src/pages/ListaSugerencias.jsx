import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Table,
  Spin,
  Input,
  message,
  Button,
  Modal,
  Form,
  Select,
  Typography,
  Tag,
  Breadcrumb
} from 'antd';
import {
  SearchOutlined,
  MessageOutlined,
  EditOutlined
} from '@ant-design/icons';
import { sugerenciasService } from '../services/sugerencia.services.js';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/MainLayout.jsx';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

export default function ListaSugerencias() {
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  // Modal para ver mensaje de sugerencia
  const [msgModalVisible, setMsgModalVisible] = useState(false);
  const [mensajeActivo, setMensajeActivo] = useState('');
const [msgAutor, setMsgAutor] = useState(null);
const [msgFecha, setMsgFecha] = useState(null);

  // Modal para responder/editar respuesta admin
  const [respModalVisible, setRespModalVisible] = useState(false);
  const [sugerenciaSel, setSugerenciaSel] = useState(null);
  const [loadingResp, setLoadingResp] = useState(false);

  // Modal para ver respuesta admin
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewRespuesta, setViewRespuesta] = useState('');
  const [viewFecha, setViewFecha] = useState(null);
  const [viewAdmin, setViewAdmin] = useState(null);

  const navigate = useNavigate();
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol?.nombre === 'administrador';
  const esEstud = usuario?.rol?.nombre === 'estudiante';

  const cargar = async () => {
    try {
      setLoading(true);
      const res = await sugerenciasService.obtenerSugerencias();
      const payload = res.data.data;
      const arr = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
      setSugerencias(arr);
      arr.length
        ? message.success(`${arr.length} sugerencias cargadas`)
        : message.info('No hay sugerencias');
    } catch (err) {
      console.error('Error cargar sugerencias:', err);
      message.error('No se pudieron cargar sugerencias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const filtered = sugerencias.filter(s =>
    `${s.titulo} ${s.categoria} ${s.estado}`
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  const tagColor = estado => {
    const map = { pendiente: 'orange', 'en proceso': 'blue', resuelta: 'green', archivada: 'default' };
    return map[estado] || 'default';
  };

  const tieneResp = s => !!s?.respuestaAdmin && String(s.respuestaAdmin).trim() !== '';

  // Ver mensaje de sugerencia
  const abrirVerMensaje = s => {
    setMensajeActivo(s.mensaje);
    setMsgAutor(s.autor);
    setMsgFecha(s.createdAt); 

    setMsgModalVisible(true);
  };

  // Ver respuesta admin
  const abrirVerRespuesta = s => {
    if (!tieneResp(s)) {
      message.warning('Esta sugerencia aún no tiene respuesta');
      return;
    }
    setViewRespuesta(s.respuestaAdmin);
    setViewFecha(s.fechaRespuesta);
    setViewAdmin(s.adminResponsable);
    setViewModalVisible(true);
  };

  // Responder o editar respuesta
  const abrirResponder = s => {
    setSugerenciaSel(s);
    form.resetFields();
    if (tieneResp(s)) {
      form.setFieldsValue({ estado: s.estado, respuesta: s.respuestaAdmin });
    }
    setRespModalVisible(true);
  };

  const enviarRespuesta = async vals => {
    try {
      setLoadingResp(true);
      await sugerenciasService.responderSugerencia(
        sugerenciaSel.id,
        vals.respuesta,
        vals.estado
      );
      message.success('Respuesta enviada');
      setRespModalVisible(false);
      await cargar();
    } catch (err) {
      console.error('Error enviar respuesta:', err);
      message.error('No se pudo enviar respuesta');
    } finally {
      setLoadingResp(false);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Título', dataIndex: 'titulo', key: 'titulo', render: t => <Text strong>{t}</Text> },
    { title: 'Categoría', dataIndex: 'categoria', key: 'categoria' },
    { title: 'Estado', dataIndex: 'estado', key: 'estado', render: e => <Tag color={tagColor(e)}>{e.toUpperCase()}</Tag> },
    { title: 'Fecha', dataIndex: 'createdAt', key: 'createdAt', render: f => f
        ? new Date(f).toLocaleString('es-CL', { year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false })
        : 'N/A' },
    {
      title: 'Mensaje',
      key: 'mensaje',
      align: 'center', // Centrar la columna de mensaje
      render: (_, r) => (
        <Button icon={<MessageOutlined />} type='link' onClick={() => abrirVerMensaje(r)} />
      )
    },
    {
      title: 'Acciones', key: 'acciones', render: (_, r) => {
        if (esEstud) {
          return (
            <Button
              disabled={!tieneResp(r)}
              icon={<MessageOutlined />}
              type='link'
              style={{ color: '#52c41a' }}
              onClick={() => abrirVerRespuesta(r)}
            >
              Ver Respuesta
            </Button>
          );
        }
        if (esAdmin) {
          return (
            <>
              <Button
                disabled={!tieneResp(r)}
                icon={<MessageOutlined />}
                type='link'
                style={{ marginRight: 8, color: '#52c41a' }}
                onClick={() => abrirVerRespuesta(r)}
              >
                Ver
              </Button>
              <Button
                disabled={r.estado === 'archivada'}
                icon={<EditOutlined />}
                type='primary'
                size='small'
                onClick={() => abrirResponder(r)}
              >
                {tieneResp(r) ? 'Editar' : 'Responder'}
              </Button>
            </>
          );
        }
        return null;
      }
    }
  ];

  return (
    <MainLayout breadcrumb={<Breadcrumb style={{ margin: '14px 0' }} />}>
      <Content style={{ padding: '48px 24px' }}>
        {!esAdmin && (
          <div style={{ textAlign: 'right', marginBottom: 16 }}>
            <Button
              type='primary'
              size='large'
              style={{ backgroundColor: '#1e3a8a', borderRadius: 8, fontWeight: 'bold' }}
              onClick={() => navigate('/sugerencias/nueva')}>
              + Nueva sugerencia
            </Button>
          </div>
        )}
        <Title level={2} style={{ color: '#1e3a8a', marginBottom: 24 }}>
          {esAdmin ? 'Sugerencias Recibidas' : 'Mis Sugerencias'}
        </Title>
        <Input
          placeholder='Buscar sugerencias...'
          prefix={<SearchOutlined style={{ color: '#1e3a8a' }} />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 300, marginBottom: 16, borderRadius: 8 }}
          allowClear
        />
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Spin size='large' />
            <div style={{ marginTop: 16 }}><Text>Cargando...</Text></div>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey='id'
            pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true, showTotal: (t, r) => `${r[0]}–${r[1]} de ${t}` }}
            bordered
            locale={{ emptyText: filtered.length ? 'No hay coincidencias' : 'Sin sugerencias' }}
          />
        )}

        {/* Modal para ver mensaje de sugerencia */}
        <Modal
          title='Mensaje de la Sugerencia'
          open={msgModalVisible}
          onCancel={() => setMsgModalVisible(false)}
          footer={null}
        >
          <Typography.Paragraph>{mensajeActivo}</Typography.Paragraph>
              {msgFecha && (
      <Text type="secondary">
        Fecha: {new Date(msgFecha).toLocaleString('es-CL')}
      </Text>
    )}
    {msgAutor && (
      <Text type="secondary" style={{ display: 'block' }}>
        Autor: {msgAutor.nombre} {msgAutor.apellido}
      </Text>
   )}
        </Modal>

        {/* Modal para ver respuesta admin */}
        <Modal
          title='Respuesta Administrativa'
          open={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={<Button onClick={() => setViewModalVisible(false)}>Cerrar</Button>}
          width={600}
        >
          <Text strong>Respuesta:</Text>
          <div style={{ margin: '8px 0', padding:12, backgroundColor:'#f5f5f5', borderRadius:4 }}>
            {viewRespuesta}
          </div>
          {viewFecha && <Text type='secondary'>Fecha: {new Date(viewFecha).toLocaleString('es-CL')}</Text>}
          {viewAdmin && <Text type='secondary' style={{ display:'block', marginTop:4 }}>Respondido por: {viewAdmin.nombre} {viewAdmin.apellido}</Text>}
        </Modal>

        {/* Modal para responder/editar */}
        {esAdmin && (
          <Modal
            title={tieneResp(sugerenciaSel) ? 'Editar Respuesta' : 'Responder Sugerencia'}
            open={respModalVisible}
            onCancel={() => setRespModalVisible(false)}
            footer={null}
            width={600}
          >
            <Form form={form} layout='vertical' onFinish={enviarRespuesta}>
              <Form.Item name='estado' label='Estado' rules={[{ required:true }]} initialValue='resuelta'>
                <Select>
                  <Option value='en proceso'>En proceso</Option>
                  <Option value='resuelta'>Resuelta</Option>
                  <Option value='archivada'>Archivada</Option>
                </Select>
              </Form.Item>
              <Form.Item name='respuesta' label='Respuesta' rules={[{required:true,message:'Escribe una respuesta'},{min:10,message:'Mínimo 10 caracteres'}]}>
                <Input.TextArea rows={4} showCount maxLength={500} />
              </Form.Item>
              <Form.Item style={{ textAlign:'right' }}>
                <Button onClick={() => setRespModalVisible(false)} style={{ marginRight:8 }}>Cancelar</Button>
                <Button type='primary' htmlType='submit' loading={loadingResp} style={{ backgroundColor:'#1e3a8a' }}>
                  {tieneResp(sugerenciaSel) ? 'Actualizar' : 'Enviar'}
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        )}
      </Content>
    </MainLayout>
  );
}
