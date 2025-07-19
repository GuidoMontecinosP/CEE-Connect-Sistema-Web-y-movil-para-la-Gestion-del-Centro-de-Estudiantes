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
           } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';
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
  const [tipo, setTipo] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!titulo || !descripcion || !fecha || !hora || !lugar || !tipo) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos.'
      });
      return;
    }
    setLoading(true);
    try {
      const data = {
        titulo,
        descripcion,
        fecha: fecha.format('YYYY-MM-DD'),
        hora: hora.format('HH:mm'),
        lugar,
        tipo
      };
      const response = await crearEvento(data);

      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'Evento creado exitosamente',
          text: 'El evento ha sido creado correctamente.'
        }).then(() => {
          navigate('/verEventos');
        });
        setTitulo('');
        setDescripcion('');
        setFecha(null);
        setHora(null);
        setLugar('');
        setTipo('');
      }
    } catch (error) {
      console.error("Error al crear el evento:", error);

      const errores = error.response?.data?.errors;
      const mensaje = error.response?.data?.message || 'Error inesperado al crear el evento.';

      if (Array.isArray(errores)) {
        Swal.fire({
          icon: 'error',
          title: 'Errores al crear el evento',
         html: `<ul style="text-align: left;">${errores.map(e => `<li>${e}</li>`).join('')}</ul>`,
        });
      } else {
        Swal.fire('Error', mensaje, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout breadcrumb={<Breadcrumb style={{ margin: '14px 0' }} />}>
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
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          bodyStyle={{ padding: 40 }}
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
            <div style={{ marginBottom: 32 }}>
              <Text strong style={{ fontSize: 16, color: '#1e3a8a', display: 'block', marginBottom: 8 }}>
                Tipo de Evento
              </Text>
              <Select
                size="large"
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
                <Option value="otro">Otro</Option>
              </Select>
            </div>
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