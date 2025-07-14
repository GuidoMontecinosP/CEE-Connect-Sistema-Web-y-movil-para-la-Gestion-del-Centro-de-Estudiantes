import React, { useState } from 'react';
import {
  Layout, Form, Input, Select, Button, Typography, message, Menu
} from 'antd';
import {
  FileTextOutlined, PieChartOutlined, DesktopOutlined, CarryOutOutlined,
  AuditOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sugerenciasService } from '../services/sugerencia.services.js';

const { Content, Sider } = Layout;
const { Title } = Typography;
const { Option } = Select;

export default function CrearSugerencia() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      
  
      
      // Validar usuario
      if (!usuario || !usuario.id) {
        message.error('No tienes permisos para crear sugerencias. Por favor, inicia sesión.');
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
      
      console.log("📤 Datos a enviar:", datosSugerencia);
      
      // Validar datos
      if (!datosSugerencia.titulo || !datosSugerencia.mensaje || !datosSugerencia.categoria) {
        message.error('Por favor completa todos los campos requeridos');
        return;
      }
      
      const resultado = await sugerenciasService.crearSugerencia(datosSugerencia);
      
      console.log("✅ Sugerencia creada exitosamente:", resultado);
      message.success('Sugerencia creada exitosamente');
      
      // Limpiar formulario
      form.resetFields();
      
      // Navegar después de un pequeño delay
      setTimeout(() => {
        navigate('/sugerencias');
      }, 1000);
      
    } catch (error) {
      console.error("❌ Error al crear sugerencia:", error);
      message.error(error.message || 'Error al crear la sugerencia');
    } finally {
      setLoading(false);
    }
  };

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
          <div style={{ maxWidth: 600, margin: '0 auto', background: '#fff', padding: 32, borderRadius: 12 }}>
            <Title level={2} style={{ color: '#1e3a8a', textAlign: 'center', marginBottom: 32 }}>
              Crear Nueva Sugerencia
            </Title>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              validateTrigger="onSubmit"
            >
              <Form.Item
                label="Título"
                name="titulo"
                rules={[
                  { required: true, message: 'Por favor ingresa un título' },
                  { min: 5, message: 'El título debe tener al menos 5 caracteres' },
                  { max: 200, message: 'El título no debe exceder 200 caracteres' }
                ]}
              >
                <Input placeholder="¿Qué quieres sugerir?" />
              </Form.Item>

              <Form.Item
                label="Mensaje"
                name="mensaje"
                rules={[
                  { required: true, message: 'Por favor escribe un mensaje' },
                  { min: 10, message: 'El mensaje debe tener al menos 10 caracteres' },
                  { max: 2000, message: 'El mensaje no debe exceder 2000 caracteres' }
                ]}
              >
                <Input.TextArea 
                  rows={4} 
                  placeholder="Describe tu sugerencia con más detalle" 
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              <Form.Item
                label="Categoría"
                name="categoria"
                rules={[{ required: true, message: 'Selecciona una categoría' }]}
              >
                <Select placeholder="Selecciona una categoría">
                  <Option value="infraestructura">Infraestructura</Option>
                  <Option value="eventos">Eventos</Option>
                  <Option value="bienestar">Bienestar</Option>
                  <Option value="otros">Otro</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Medio de contacto (opcional)"
                name="contacto"
                rules={[
                  { max: 100, message: 'El contacto no debe exceder 100 caracteres' }
                ]}
              >
                <Input placeholder="Ej: tu correo o Instagram" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  style={{
                    backgroundColor: '#1e3a8a',
                    borderRadius: 8,
                    fontWeight: 'bold',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {loading ? 'Creando sugerencia...' : 'Enviar sugerencia'}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}