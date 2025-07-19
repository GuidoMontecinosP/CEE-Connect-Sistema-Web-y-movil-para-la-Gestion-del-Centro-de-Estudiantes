import React, { useEffect, useState } from 'react';
import {
  Layout, Form, Input, Select, Button, Typography, message, Menu, Spin,Breadcrumb,  Card, Divider, Row, Col
} from 'antd';

import {
  FileTextOutlined, PieChartOutlined, DesktopOutlined, CarryOutOutlined,
  AuditOutlined, UserOutlined,CheckOutlined
} from '@ant-design/icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sugerenciasService } from '../services/sugerencia.services.js';
import MainLayout from '../components/MainLayout';
const { Content, Sider } = Layout;
const { Title,Text } = Typography;
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
    setTimeout(() => {
        navigate('/sugerencias');
      }, 1000);
 
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
    <div>
      <div style={{ maxWidth: 800, margin: '0 auto' }}> 
        {/* Header de la página */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Title level={1} style={{ color: '#1e3a8a', marginBottom: 8 }}>
            Editar Sugerencia
          </Title>
          <Text style={{ fontSize: 16, color: '#64748b' }}>
            Modifica los datos de tu sugerencia
          </Text>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            {/* Formulario */}
            <Card
              style={{
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              bodyStyle={{ padding: 40 }}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
              >
                {/* Título */}
                <div style={{ marginBottom: 32 }}>
                  <Text strong style={{ fontSize: 16, color: '#1e3a8a', display: 'block', marginBottom: 8 }}>
                    Título de la Sugerencia
                  </Text>
                  <Form.Item
                    name="titulo"
                    rules={[
                      { message: 'Ingresa un título' }, 
                      { min: 5, message: 'El título debe tener al menos 5 caracteres' },
                      { max: 200, message: 'El título no debe exceder 200 caracteres' }
                    ]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input
                      placeholder={datosIniciales.titulo || "Ingresa el título de tu sugerencia..."}
                      style={{
                        borderRadius: 8,
                        fontSize: 16
                      }}
                    />
                  </Form.Item>
                </div>

                <Divider style={{ margin: '32px 0' }} />

                {/* Mensaje */}
                <div style={{ marginBottom: 32 }}>
                  <Text strong style={{ fontSize: 16, color: '#1e3a8a', display: 'block', marginBottom: 8 }}>
                    Descripción Detallada
                  </Text>
                  <Form.Item
                    name="mensaje"
                    rules={[
                      { message: 'Ingresa un mensaje' }, 
                      { min: 10, message: 'El mensaje debe tener al menos 10 caracteres' },
                      { max: 500, message: 'El mensaje no debe exceder 500 caracteres' }
                    ]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input.TextArea
                      rows={4}
                      placeholder={datosIniciales.mensaje || "Describe tu sugerencia en detalle..."}
                      showCount
                      maxLength={500}
                      style={{
                        borderRadius: 8,
                        fontSize: 16
                      }}
                    />
                  </Form.Item>
                </div>

                <Divider style={{ margin: '32px 0' }} />

                {/* Categoría y Contacto */}
                <div style={{ marginBottom: 32 }}>
                  <Title level={4} style={{ color: '#1e3a8a', marginBottom: 24 }}>
                    Información Adicional
                  </Title>
                  
                  <Row gutter={24}>
                    <Col span={12}>
                      <Text strong style={{ fontSize: 16, color: '#1e3a8a', display: 'block', marginBottom: 8 }}>
                        Categoría
                      </Text>
                      <Form.Item
                        name="categoria"
                        rules={[{ message: 'Selecciona una categoría' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <Select 
                          placeholder={datosIniciales.categoria || "Selecciona una categoría..."}
                          style={{
                            borderRadius: 8,
                            fontSize: 16
                          }}
                        >
                          <Option value="infraestructura">Infraestructura</Option>
                          <Option value="eventos">Eventos</Option>
                          <Option value="bienestar">Bienestar</Option>
                          <Option value="otros">Otro</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    
                    <Col span={12}>
                      <Text strong style={{ fontSize: 16, color: '#1e3a8a', display: 'block', marginBottom: 8 }}>
                        Contacto (Opcional)
                      </Text>
                      <Form.Item
                        name="contacto"
                        style={{ marginBottom: 0 }}
                      >
                        <Input
                          placeholder={datosIniciales.contacto || "Email o teléfono de contacto (opcional)..."}
                          style={{
                            borderRadius: 8,
                            fontSize: 16
                          }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                <Divider style={{ margin: '32px 0' }} />

                {/* Botones de acción */}
                <Row gutter={16} justify="end">
                  <Col>
                    <Button
                      size="large"
                      onClick={() => navigate('/mis-sugerencias')}
                      style={{
                        borderRadius: 8,
                        height: 48,
                        paddingLeft: 24,
                        paddingRight: 24,
                        fontSize: 16
                      }}
                    >
                      Cancelar
                    </Button>
                  </Col>
                  <Col>
                    <Button
                      type="primary"
                      size="large"
                      htmlType="submit"
                      loading={updating}
                      icon={<CheckOutlined />}
                      style={{
                        backgroundColor: '#1e3a8a',
                        borderColor: '#1e3a8a',
                        borderRadius: 8,
                        height: 48,
                        paddingLeft: 24,
                        paddingRight: 24,
                        fontSize: 16,
                        fontWeight: 500
                      }}
                    >
                      {updating ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card>

            {/* Información adicional */}
            <Card
              style={{
                marginTop: 24,
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: 12
              }}
              bodyStyle={{ padding: 24 }}
            >
              <Title level={5} style={{ color: '#1e3a8a', marginBottom: 12 }}>
                💡 Consejos para editar tu sugerencia
              </Title>
              <ul style={{ color: '#64748b', marginBottom: 0 }}>
                <li>Solo se guardarán los campos que hayas modificado</li>
                <li>Puedes actualizar cualquier campo excepto el autor</li>
                <li>Los cambios serán visibles inmediatamente</li>
                <li>Si no cambias nada, no se realizará ninguna actualización</li>
              </ul>
            </Card>
          </>
        )}
      </div>
    </div>
  </MainLayout>
);
}