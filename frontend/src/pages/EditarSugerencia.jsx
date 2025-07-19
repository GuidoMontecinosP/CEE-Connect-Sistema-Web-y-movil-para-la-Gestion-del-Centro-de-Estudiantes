import React, { useEffect, useState } from 'react';
import {
  Layout, Form, Input, Select, Button, Typography, message, Menu, Spin,Breadcrumb
} from 'antd';
import {
  FileTextOutlined, PieChartOutlined, DesktopOutlined, CarryOutOutlined,
  AuditOutlined, UserOutlined
} from '@ant-design/icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sugerenciasService } from '../services/sugerencia.services.js';
import MainLayout from '../components/MainLayout';
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
  const [messageApi, contextHolder] = message.useMessage();

  // Datos pasados desde la navegación (para usar como placeholders)
  const datosIniciales = location.state?.sugerencia || {};

  useEffect(() => {
    const cargarSugerencia = async () => {
      try {
        const res = await sugerenciasService.obtenerSugerenciaPorId(id);
        console.log("Sugerencia cargada:", res.data.autor.id);
        const datos = res.data.data;
        
      if (usuario.id !== res.data.autor.id) {
          messageApi.error("No tienes permiso para editar esta sugerencia");
          navigate('/mis-sugerencias');
          return;
        }
        setDatosOriginales(datos);
        form.setFieldsValue(datos);
      } catch (err) {
        console.error("Error al cargar sugerencia:", err);
        messageApi.error("No se pudo cargar la sugerencia");
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
     messageApi.warning("No se detectaron cambios");
      return;
    }
    
   // console.log('Datos finales a enviar:', datosActualizados);
    
    await sugerenciasService.actualizarSugerencia(id, datosActualizados);
    
    messageApi.success("Sugerencia actualizada exitosamente");
    navigate('/mis-sugerencias');
  } catch (err) {
    console.log("Error al actualizar:", err.message);
    messageApi.error(err.message || "Error al actualizar sugerencia");
  } finally {
    setUpdating(false);
  }
};


  return (
    <MainLayout
    selectedKeyOverride="8" 
    breadcrumb={
      <Breadcrumb style={{ margin: '14px 0' }} 
      />
    }
  >
       {contextHolder}
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
                  rules={[{  message: 'Ingresa un título' }, { min: 5, message: 'El título debe tener al menos 5 caracteres' },
    { max: 200, message: 'El título no debe exceder 200 caracteres' }]}
                >
                  <Input 
                    placeholder={datosIniciales.titulo || "Ingresa el título de tu sugerencia..."}
                  />
                </Form.Item>
                <Form.Item
                  label="Mensaje"
                  name="mensaje"
                  rules={[{  message: 'Ingresa un mensaje' }, { min: 10, message: 'El mensaje debe tener al menos 10 caracteres' },
    { max: 500, message: 'El mensaje no debe exceder 500 caracteres' }]}
                >
                  <Input.TextArea 
                    rows={4} 
                    placeholder={datosIniciales.mensaje || "Describe tu sugerencia en detalle..."}
                    showCount
                    maxLength={500}
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
     </MainLayout>
  );
}