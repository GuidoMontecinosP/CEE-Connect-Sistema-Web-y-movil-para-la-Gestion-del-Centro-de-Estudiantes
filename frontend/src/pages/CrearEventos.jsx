import React, { useState } from 'react';
import { crearEvento } from '../services/eventos.services.js';
import {  Card, Input, 
          Button, 
          Typography, 
          Row, Col, 
          Divider, 
          Breadcrumb, 
          DatePicker, 
          TimePicker, 
          Select,
          message,
           } from 'antd';
import { CheckOutlined } from '@ant-design/icons';

import MainLayout from '../components/MainLayout.jsx';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

function CrearEvento() {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(null);
  const [hora, setHora] = useState(null);
  const [lugar, setLugar] = useState('');
  const [imagen, setImagen] = useState(null);
  const [tipo, setTipo] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [messageApi, contextHolder] = message.useMessage();

  const handleSubmit = async () => {
    if (!titulo || !descripcion || !fecha || !hora || !lugar || !tipo) {
      messageApi.error('Por favor completa todos los campos requeridos');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('titulo', titulo);
      formData.append('descripcion', descripcion);
      formData.append('fecha', fecha.format('YYYY-MM-DD'));
      formData.append('hora', hora.format('HH:mm'));
      formData.append('lugar', lugar);
      formData.append('tipo', tipo);
      
      if (imagen) {
        formData.append('imagen', imagen);
      }
      
      const response = await crearEvento(formData);

      if (response.success) {
        messageApi.success('Evento creado exitosamente')
        .then(() => {
          navigate('/verEventos');
        });
        setTitulo('');
        setDescripcion('');
        setFecha(null);
        setHora(null);
        setLugar('');
        setTipo('');
        setImagen(null);
      }
    } catch (error) {

      const mensaje = error.response?.data?.message || 'Error inesperado al crear el evento.';
      messageApi.error(mensaje);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout breadcrumb>
      {contextHolder}
      <div>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Title level={1} style={{ color: '#1e3a8a', marginBottom: 8 }}>
            Añadir Nuevo Evento
          </Title>
          <Text style={{ fontSize: 16, color: '#64748b' }}>
            Completa el formulario para crear un nuevo evento. Asegúrate de que la información sea clara y precisa.
          </Text>
        </div>
        <Card
          style={{
            maxWidth: 800,
            margin: '0 auto',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: 40,
          }}
        >
          <div>
            <div style={{ marginBottom: 24 }}>
              <Text strong style={{ fontSize: 16, color: '#1e3a8a', display: 'block', marginBottom: 8 }}>
                Título del Evento
              </Text>
              <Input
                size="large"
                placeholder="Ingresa el título del evento"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                style={{ borderRadius: 8, fontSize: 16 }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <Text strong style={{ fontSize: 16, color: '#1e3a8a', display: 'block', marginBottom: 8 }}>
                Descripción
              </Text>
              <Input.TextArea
                rows={3}
                placeholder="Describe el evento"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                style={{ borderRadius: 8, fontSize: 16 }}
              />
            </div>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} md={8}>
                <Text strong style={{ fontSize: 16, color: '#1e3a8a', display: 'block', marginBottom: 8 }}>
                  Fecha
                </Text>
                <DatePicker
                  style={{ width: '100%', borderRadius: 8 }}
                  value={fecha}
                  onChange={setFecha}
                  format="YYYY-MM-DD"
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text strong style={{ fontSize: 16, color: '#1e3a8a', display: 'block', marginBottom: 8 }}>
                  Hora
                </Text>
                <TimePicker
                  style={{ width: '100%', borderRadius: 8 }}
                  value={hora}
                  onChange={setHora}
                  format="HH:mm"
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text strong style={{ fontSize: 16, color: '#1e3a8a', display: 'block', marginBottom: 8 }}>
                  Lugar
                </Text>
                <Input
                  size="large"
                  placeholder="Ej: Auditorio, Sala 101, etc."
                  value={lugar}
                  onChange={(e) => setLugar(e.target.value)}
                  style={{ borderRadius: 8, fontSize: 16 }}
                />
              </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} md={8}>
                <Text strong style={{ fontSize: 16, color: '#1e3a8a', display: 'block', marginBottom: 8 }}>
                  Tipo de Evento
                </Text>
                <Select
  
                  placeholder="Selecciona el tipo de evento"
                  value={tipo}
                  onChange={setTipo}
                  style={{ width: '100%', borderRadius: 8 }}
                >
                  <Option value="Charla">Charla</Option>
                  <Option value="Taller">Taller</Option>
                  <Option value="Conferencia">Conferencia</Option>
                  <Option value="Reunión">Reunión</Option>
                  <Option value="Recreativo">Recreativo</Option>
                  <Option value="Otro">Otro</Option>
                </Select>
              </Col>

              <Col xs={24} sm={12} md={13}>
                <Text strong style={{ fontSize: 16, color: '#1e3a8a', display: 'block', marginBottom: 8 }}>
                  Imagen del Lugar (opcional)
                </Text>
                <Input                  
                  type="file"
                  onChange={(e) => setImagen(e.target.files[0])}
                />
              </Col>
            </Row>
            
            <Divider style={{ margin: '32px 0' }} />
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
                  onClick={handleSubmit}
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
                  {loading ? 'Creando...' : 'Crear Evento'}
                </Button>
              </Col>
            </Row>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}

export default CrearEvento;