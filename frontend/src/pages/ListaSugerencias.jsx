import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout, Menu, Card, Typography, Tag, Table, Spin, Input, message, Button, Modal,
  Form, Select
} from 'antd';
import {
  FileTextOutlined, PieChartOutlined, DesktopOutlined, CarryOutOutlined,
  AuditOutlined, SearchOutlined, MessageOutlined, EditOutlined
} from '@ant-design/icons';
import { sugerenciasService } from '../services/sugerencia.services.js';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

function ListaSugerencias() {
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [mensajeActivo, setMensajeActivo] = useState('');
  
  // Estados para modal de respuesta
  const [modalRespuestaVisible, setModalRespuestaVisible] = useState(false);
  const [sugerenciaSeleccionada, setSugerenciaSeleccionada] = useState(null);
  const [loadingRespuesta, setLoadingRespuesta] = useState(false);
  const [form] = Form.useForm();

  const navigate = useNavigate();

  useEffect(() => {
    const cargarSugerencias = async () => {
      try {
        setLoading(true);
        const res = await sugerenciasService.obtenerSugerencias();
        console.log("Respuesta del backend:", res);

        const sugerenciasArray = res.data.data || [];
        console.log("Sugerencias obtenidas:", sugerenciasArray);

        setSugerencias(sugerenciasArray);
        
        // Mensaje de éxito si hay sugerencias
        if (sugerenciasArray.length > 0) {
          message.success(`${sugerenciasArray.length} sugerencias cargadas exitosamente`);
        } else {
          message.info('No se encontraron sugerencias');
        }
      } catch (err) {
        console.error('Error al cargar sugerencias:', err);
        message.error('Error al cargar las sugerencias');
        setSugerencias([]);
      } finally {
        setLoading(false);
      }
    };

    cargarSugerencias();
  }, []);

  const filteredSugerencias = sugerencias.filter(s => {
    const texto = `${s.titulo} ${s.categoria} ${s.estado}`.toLowerCase();
    return texto.includes(searchText.toLowerCase());
  });

  const getEstadoTag = (estado) => {
    const estados = {
      pendiente: { color: 'orange' },
      'en proceso': { color: 'blue' },
      resuelta: { color: 'green' },
      archivada: { color: 'default' }
    };
    return <Tag color={estados[estado]?.color || 'default'}>{estado.toUpperCase()}</Tag>;
  };

  const handleResponder = (sugerencia) => {
    setSugerenciaSeleccionada(sugerencia);
    setModalRespuestaVisible(true);
    form.resetFields();
  };

  const handleSubmitRespuesta = async (values) => {
    try {
      setLoadingRespuesta(true);
      
      const respuesta = await sugerenciasService.responderSugerencia(
        sugerenciaSeleccionada.id,
        {
          respuesta: values.respuesta,
          estado: values.estado
        }
      );

      message.success('Respuesta enviada exitosamente');
      setModalRespuestaVisible(false);
      
      // Actualizar la lista de sugerencias
      setSugerencias(prev => 
        prev.map(s => 
          s.id === sugerenciaSeleccionada.id 
            ? { ...s, estado: values.estado, respuestaAdmin: values.respuesta }
            : s
        )
      );
      
    } catch (error) {
      console.error('Error al responder sugerencia:', error);
      message.error('Error al enviar la respuesta');
    } finally {
      setLoadingRespuesta(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: 'Título',
      dataIndex: 'titulo',
      key: 'titulo',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Categoría',
      dataIndex: 'categoria',
      key: 'categoria'
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: getEstadoTag
    },
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (fecha) => {
        return fecha ? new Date(fecha).toLocaleString('es-CL', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }) : 'N/A';
      }
    },
    {
      title: 'Mensaje',
      key: 'mensaje',
      render: (_, record) => (
        <Button
          icon={<MessageOutlined />}
          onClick={() => {
            setMensajeActivo(record.mensaje);
            setModalVisible(true);
          }}
          type="link"
        />
      )
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => handleResponder(record)}
          type="primary"
          size="small"
          disabled={record.estado === 'resuelta' || record.estado === 'archivada'}
        >
          Responder
        </Button>
      )
    }
  ];

  const menuItems = [
    { key: '0', icon: <FileTextOutlined />, label: 'Inicio' },
    { key: '1', icon: <PieChartOutlined />, label: 'Votaciones' },
    { key: '2', icon: <DesktopOutlined />, label: 'Crear Votación' },
    { key: '3', icon: <CarryOutOutlined />, label: 'Eventos' },
    { key: '4', icon: <FileTextOutlined />, label: 'Sugerencias' },
    { key: '5', icon: <AuditOutlined />, label: 'Dashboard' }
  ];

  const onMenuClick = (item) => {
    if (item.key === '0') navigate('/noticias');
    if (item.key === '1') navigate('/votaciones');
    if (item.key === '2') navigate('/crear');
    if (item.key === '3') navigate('/eventos');
    if (item.key === '4') navigate('/sugerencias');
    if (item.key === '5') navigate('/dashboard');
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#1e3a8a' }}>
      <Sider theme="dark" collapsible>
        <Menu 
          mode="inline" 
          theme="dark" 
          defaultSelectedKeys={['4']}
          items={menuItems} 
          onClick={onMenuClick} 
        />
      </Sider>
      <Layout>
        <Content style={{ padding: '48px 24px' }}>
          <div style={{ textAlign: 'right', marginBottom: 16 }}>
            <Button
              type="primary"
              size="large"
              style={{
                backgroundColor: '#1e3a8a',
                borderRadius: 8,
                fontWeight: 'bold',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
              }}
              onClick={() => navigate('/sugerencias/nueva')}
            >
              + Nueva Sugerencia
            </Button>
          </div>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Title level={2} style={{ color: '#1e3a8a', marginBottom: 24 }}>
              Sugerencias Recibidas
            </Title>
            
            <Input
              placeholder="Buscar sugerencias..."
              prefix={<SearchOutlined style={{ color: '#1e3a8a' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300, marginBottom: 16, borderRadius: 8 }}
              allowClear
            />
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <Text>Cargando sugerencias...</Text>
                </div>
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={filteredSugerencias}
                rowKey="id"
                pagination={{ 
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} de ${total} sugerencias`
                }}
                bordered
                locale={{
                  emptyText: searchText ? 
                    'No se encontraron sugerencias que coincidan con la búsqueda' : 
                    'No hay sugerencias disponibles'
                }}
              />
            )}
          </div>
        </Content>

        {/* Modal para ver mensaje */}
        <Modal
          title="Mensaje de la Sugerencia"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          <Typography.Paragraph>{mensajeActivo}</Typography.Paragraph>
        </Modal>

        {/* Modal para responder sugerencia */}
        <Modal
          title={`Responder Sugerencia: ${sugerenciaSeleccionada?.titulo || ''}`}
          open={modalRespuestaVisible}
          onCancel={() => setModalRespuestaVisible(false)}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmitRespuesta}
          >
            <Form.Item
              label="Estado"
              name="estado"
              rules={[{ required: true, message: 'Por favor selecciona un estado' }]}
              initialValue="resuelta"
            >
              <Select placeholder="Selecciona el estado">
                <Option value="en proceso">En Proceso</Option>
                <Option value="resuelta">Resuelta</Option>
                <Option value="archivada">Archivada</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Respuesta"
              name="respuesta"
              rules={[
                { required: true, message: 'Por favor ingresa una respuesta' },
                { min: 10, message: 'La respuesta debe tener al menos 10 caracteres' }
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Escribe tu respuesta aquí..."
                showCount
                maxLength={500}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Button
                onClick={() => setModalRespuestaVisible(false)}
                style={{ marginRight: 8 }}
              >
                Cancelar
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loadingRespuesta}
                style={{ backgroundColor: '#1e3a8a' }}
              >
                Enviar Respuesta
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Layout>
    </Layout>
  );
}

export default ListaSugerencias;