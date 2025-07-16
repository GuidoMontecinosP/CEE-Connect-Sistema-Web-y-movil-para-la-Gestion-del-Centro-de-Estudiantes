import React, { useEffect, useState } from 'react';
import {
  Layout, Form, Input, Select, Button, Typography, message, Menu, Spin
} from 'antd';
import {
  FileTextOutlined, PieChartOutlined, DesktopOutlined, CarryOutOutlined,
  AuditOutlined, UserOutlined
} from '@ant-design/icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sugerenciasService } from '../services/sugerencia.services.js';

const { Content, Sider } = Layout;
const { Title } = Typography;
const { Option } = Select;

export default function EditarSugerencia() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [datosOriginales, setDatosOriginales] = useState(null);
  const { id } = useParams();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Datos pasados desde la navegación (para usar como placeholders)
  const datosIniciales = location.state?.sugerencia || {};

  useEffect(() => {
    const cargarSugerencia = async () => {
      try {
        const res = await sugerenciasService.obtenerSugerenciaPorId(id);
        const datos = res.data.data;
        setDatosOriginales(datos);
        form.setFieldsValue(datos);
      } catch (err) {
        console.error("Error al cargar sugerencia:", err);
        message.error("No se pudo cargar la sugerencia");
        navigate('/mis-sugerencias');
      } finally {
        setLoading(false);
      }
    };

    cargarSugerencia();
  }, [id, form, navigate]);

  const onFinish = async (values) => {
  try {
    setUpdating(true);
    
    // Solo enviar campos que realmente cambiaron
    const datosActualizados = {};
    
    if (values.titulo && values.titulo.trim() !== datosOriginales?.titulo) {
      datosActualizados.titulo = values.titulo.trim();
    }
    if (values.mensaje && values.mensaje.trim() !== datosOriginales?.mensaje) {
      datosActualizados.mensaje = values.mensaje.trim();
    }
    if (values.categoria && values.categoria !== datosOriginales?.categoria) {
      datosActualizados.categoria = values.categoria;
    }
    if (values.contacto?.trim() !== datosOriginales?.contacto) {
      datosActualizados.contacto = values.contacto?.trim() || null;
    }
    
    // Verificar que hay al menos un cambio
    if (Object.keys(datosActualizados).length === 0) {
      message.warning("No se detectaron cambios");
      return;
    }
    
    console.log('Datos finales a enviar:', datosActualizados);
    
    await sugerenciasService.actualizarSugerencia(id, datosActualizados);
    
    message.success("Sugerencia actualizada exitosamente");
    navigate('/mis-sugerencias');
  } catch (err) {
    console.error("Error al actualizar:", err);
    message.error(err.message || "Error al actualizar sugerencia");
  } finally {
    setUpdating(false);
  }
};


  const menuItems = [
    { key: '0', icon: <FileTextOutlined />, label: 'Inicio' },
    { key: '1', icon: <PieChartOutlined />, label: 'Votaciones' },
    { key: '2', icon: <DesktopOutlined />, label: 'Crear Votación' },
    { key: '3', icon: <CarryOutOutlined />, label: 'Eventos' },
    { key: '4', icon: <FileTextOutlined />, label: 'Sugerencias' },
    { key: '6', icon: <UserOutlined />, label: 'Mis sugerencias' },
    { key: '5', icon: <AuditOutlined />, label: 'Dashboard' }
  ];

  const onMenuClick = (item) => {
    const rutas = {
      '0': '/noticias',
      '1': '/votaciones',
      '2': '/crear',
      '3': '/eventos',
      '4': '/sugerencias',
      '5': '/dashboard',
      '6': '/mis-sugerencias'
    };
    navigate(rutas[item.key]);
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#1e3a8a' }}>
      <Sider theme="dark" collapsible>
        <Menu 
          mode="inline" 
          theme="dark" 
          defaultSelectedKeys={['6']} 
          items={menuItems} 
          onClick={onMenuClick} 
        />
      </Sider>
      <Layout>
        <Content style={{ padding: '48px 24px' }}>
          <div style={{ maxWidth: 600, margin: '0 auto', background: '#fff', padding: 32, borderRadius: 12 }}>
            <Title level={2} style={{ color: '#1e3a8a', textAlign: 'center', marginBottom: 32 }}>
              Editar Sugerencia
            </Title>

            {loading ? (
              <div style={{ textAlign: 'center' }}>
                <Spin size="large" />
              </div>
            ) : (
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
              >
                <Form.Item
                  label="Título"
                  name="titulo"
                  rules={[{  message: 'Ingresa un título' }]}
                >
                  <Input 
                    placeholder={datosIniciales.titulo || "Ingresa el título de tu sugerencia..."}
                  />
                </Form.Item>
                <Form.Item
                  label="Mensaje"
                  name="mensaje"
                  rules={[{  message: 'Ingresa un mensaje' }]}
                >
                  <Input.TextArea 
                    rows={4} 
                    placeholder={datosIniciales.mensaje || "Describe tu sugerencia en detalle..."}
                  />
                </Form.Item>
                <Form.Item
                  label="Categoría"
                  name="categoria"
                  rules={[{  message: 'Selecciona una categoría' }]}
                >
                  <Select placeholder={datosIniciales.categoria || "Selecciona una categoría..."}>
                    <Option value="infraestructura">Infraestructura</Option>
                    <Option value="eventos">Eventos</Option>
                    <Option value="bienestar">Bienestar</Option>
                    <Option value="otros">Otro</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="Contacto" name="contacto">
                  <Input 
                    placeholder={datosIniciales.contacto || "Email o teléfono de contacto (opcional)..."}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={updating}
                    block
                    style={{ backgroundColor: '#1e3a8a' }}
                  >
                    Guardar Cambios
                  </Button>
                </Form.Item>
              </Form>
            )}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}