import React, { useState } from 'react';
import {
  Layout, Form, Input, Select, Button, Typography, message, Menu, Breadcrumb,
  Card, Divider, Row, Col
} from 'antd';
import {
  FileTextOutlined, PieChartOutlined, DesktopOutlined, CarryOutOutlined,
  AuditOutlined, CheckOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sugerenciasService } from '../services/sugerencia.services.js';
import MainLayout from '../components/MainLayout';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
export default function CrearSugerencia() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      
      // Validar usuario
      if (!usuario || !usuario.id) {
        messageApi.error('No tienes permisos para crear sugerencias. Por favor, inicia sesión.');
        return;
      }
      
      // Preparar datos
      const datosSugerencia = {
        titulo: values.titulo?.trim(),
        mensaje: values.mensaje?.trim(),
        categoria: values.categoria,
        contacto: values.contacto?.trim() || null,
        autorId: usuario.id
      };
      
     // console.log("📤 Datos a enviar:", datosSugerencia);
      
      // Validar datos
      if (!datosSugerencia.titulo || !datosSugerencia.mensaje || !datosSugerencia.categoria) {
        messageApi.error('Por favor completa todos los campos requeridos');
        return;
      }
      
      const resultado = await sugerenciasService.crearSugerencia(datosSugerencia);
      
      console.log("✅ Sugerencia creada exitosamente:", resultado);
      messageApi.success('Sugerencia creada exitosamente');
      
      // Limpiar formulario
      form.resetFields();
      
      // Navegar después de un pequeño delay
      setTimeout(() => {
        navigate('/sugerencias');
      }, 1000);
      
    } catch (error) {
      const errorMessage = error.message || 'Error al crear la sugerencia';
      //console.log("Mensaje de error a mostrar:", errorMessage);
      messageApi.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

return (
  <MainLayout
    breadcrumb={
      <Breadcrumb style={{ margin: '14px 0' }} />
    }
  >
    {contextHolder}
    <div>
      <div style={{ maxWidth: 800, margin: '0 auto' }}> 
        {/* Header de la página */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Title level={1} style={{ color: '#1e3a8a', marginBottom: 8 }}>
            Crear Nueva Sugerencia
          </Title>
          <Text style={{ fontSize: 16, color: '#64748b' }}>
            Comparte tu idea para mejorar nuestra comunidad
          </Text>
        </div>

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
            validateTrigger="onSubmit"
          >
            {/* Título */}
            <div style={{ marginBottom: 32 }}>
              <Text strong style={{ fontSize: 16, color: '#1e3a8a', display: 'block', marginBottom: 8 }}>
                Título de la Sugerencia
              </Text>
              <Form.Item
                name="titulo"
                rules={[
                  { required: true, message: 'Por favor ingresa un título' },
                  { min: 5, message: 'El título debe tener al menos 5 caracteres' },
                  { max: 200, message: 'El título no debe exceder 200 caracteres' }
                ]}
                style={{ marginBottom: 0 }}
              >
                <Input
                  placeholder="¿Qué quieres sugerir?"
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
                  { required: true, message: 'Por favor escribe un mensaje' },
                  { min: 10, message: 'El mensaje debe tener al menos 10 caracteres' },
                  { max: 2000, message: 'El mensaje no debe exceder 2000 caracteres' }
                ]}
                style={{ marginBottom: 0 }}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Describe tu sugerencia con más detalle"
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
                    rules={[{ required: true, message: 'Selecciona una categoría' }]}
                    style={{ marginBottom: 0 }}
                  >
                    <Select 
                      placeholder="Selecciona una categoría"
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
                    rules={[
                      { max: 100, message: 'El contacto no debe exceder 100 caracteres' }
                    ]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input
                      placeholder="Ej: correo o instagram"
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
                  onClick={() => window.history.back()}
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
                  loading={loading}
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
                  {loading ? 'Enviando...' : 'Enviar Sugerencia'}
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
            💡 Consejos para crear una buena sugerencia
          </Title>
          <ul style={{ color: '#64748b', marginBottom: 0 }}>
            <li>Sé específico en tu título y descripción</li>
            <li>Explica claramente el beneficio de tu sugerencia</li>
            <li>Selecciona la categoría más apropiada</li>
            <li>El contacto es opcional pero ayuda para seguimiento</li>
          </ul>
        </Card>
      </div>
    </div>
  </MainLayout>
);
}