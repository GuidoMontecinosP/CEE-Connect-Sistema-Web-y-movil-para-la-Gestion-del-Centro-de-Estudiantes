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
  EditOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { sugerenciasService } from '../services/sugerencia.services.js';
import { reportesService } from '../services/reporte.services.js';
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
  const [reportForm] = Form.useForm();
  const [confirmandoEliminacion, setConfirmandoEliminacion] = useState(false);
  const [misReportes, setMisReportes] = useState([]);

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

  // Estados para reportes
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [sugerenciaAReportar, setSugerenciaAReportar] = useState(null);
  const [loadingReporte, setLoadingReporte] = useState(false);

  // Estados para gestión de reportes (ADMIN)
  const [infoReporteVisible, setInfoReporteVisible] = useState(false);
  const [reporteInfo, setReporteInfo] = useState(null);
  const [loadingEliminarReporte, setLoadingEliminarReporte] = useState(false);

  const navigate = useNavigate();
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol?.nombre === 'administrador';
  const esEstud = usuario?.rol?.nombre === 'estudiante';

  const cargar = async () => {
    try {
      setLoading(true);
      
      // Cargar sugerencias
      const res = await sugerenciasService.obtenerSugerencias();
      const payload = res.data.data;
      const arr = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
      setSugerencias(arr);
      
      // Cargar reportes del usuario actual (solo si es estudiante)
      if (esEstud) {
        try {
          const reportesRes = await reportesService.obtenerMisReportes();
          console.log('Mis reportes (respuesta completa):', reportesRes);
          
          // CORRECCIÓN: Extraer correctamente los IDs de las sugerencias reportadas
          const reportesData = reportesRes.data || [];
          const sugerenciasReportadas = reportesData.map(reporte => {
            // Asegurarse de que obtenemos el ID correcto
            const sugerenciaId = reporte.sugerencia?.id || reporte.sugerenciaId;
            console.log('Sugerencia reportada ID:', sugerenciaId);
            return sugerenciaId;
          }).filter(id => id !== undefined && id !== null);
          
          console.log('IDs de sugerencias reportadas:', sugerenciasReportadas);
          setMisReportes(sugerenciasReportadas);
          
        } catch (error) {
          console.error('Error al cargar mis reportes:', error);
          setMisReportes([]);
        }
      }
      
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

  // FUNCIÓN CORREGIDA: Verificar si puedo reportar esta sugerencia
  const puedeReportar = (sugerencia) => {
  console.log('Verificando si puede reportar:', {
    sugerenciaId: sugerencia.id,
    esEstud,
    esPropia: sugerencia.autor?.id === usuario?.id,
    estado: sugerencia.estado,
    misReportes,
    yaReportada: misReportes.includes(sugerencia.id) || misReportes.includes(String(sugerencia.id))
  });
  
  // Solo estudiantes pueden reportar
  if (!esEstud) {
    console.log('No puede reportar: no es estudiante');
    return false;
  }
  
  // No puede reportar sus propias sugerencias
  if (sugerencia.autor?.id === usuario?.id) {
    console.log('No puede reportar: es su propia sugerencia');
    return false;
  }
  
  // No puede reportar sugerencias archivadas
  if (sugerencia.estado === 'archivada') {
    console.log('No puede reportar: sugerencia archivada');
    return false;
  }
  
  // CORRECCIÓN: Solo verificar si YO ya reporté esta sugerencia, no si alguien más la reportó
  const yaReportePorMi = misReportes.includes(sugerencia.id) || 
                         misReportes.includes(String(sugerencia.id)) ||
                         misReportes.includes(Number(sugerencia.id));
  
  if (yaReportePorMi) {
    console.log('No puede reportar: ya reporté esta sugerencia');
    return false;
  }
  
  // REMOVIDO: La verificación de sugerencia.isReportada 
  // porque no debe impedir que otros usuarios reporten
  
  console.log('Puede reportar: todas las condiciones se cumplen');
  return true;
};

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

  // FUNCIÓN CORREGIDA: Abrir modal de reporte
  const abrirReportar = (sugerencia) => {
    console.log('Intentando abrir modal de reporte para:', sugerencia);
    
    // Verificación adicional antes de abrir el modal
    if (!puedeReportar(sugerencia)) {
      if (sugerencia.isReportada) {
        message.warning('Esta sugerencia ya ha sido reportada');
      } else if (misReportes.includes(sugerencia.id) || misReportes.includes(String(sugerencia.id))) {
        message.warning('Ya has reportado esta sugerencia');
      } else {
        message.warning('No puedes reportar esta sugerencia');
      }
      return;
    }
    
    console.log('Abriendo modal de reporte...');
    setSugerenciaAReportar(sugerencia);
    reportForm.resetFields();
    setReportModalVisible(true);
  };

  // Enviar reporte
  const enviarReporte = async (valores) => {
    try {
      setLoadingReporte(true);
      console.log('Enviando reporte para sugerencia:', sugerenciaAReportar.id);
      
      await reportesService.crearReporte(sugerenciaAReportar.id, valores.motivo);
      message.success('Reporte enviado exitosamente');
      setReportModalVisible(false);
      
      // CORRECCIÓN: Asegurar que agregamos el ID correcto a misReportes
      setMisReportes(prev => {
        const nuevosReportes = [...prev, sugerenciaAReportar.id];
        console.log('Actualizando misReportes:', nuevosReportes);
        return nuevosReportes;
      });
      
      await cargar(); // Recargar para actualizar el estado general
    } catch (err) {
      console.error('Error al enviar reporte:', err);
      message.error(err.message || 'No se pudo enviar el reporte');
    } finally {
      setLoadingReporte(false);
    }
  };

  const verInfoReporte = async (sugerencia) => {
    try {
      setLoadingEliminarReporte(true);
      const response = await reportesService.obtenerReportes(1, 100);
      const reportes = response.data?.data || [];
      
      const reporte = reportes.find(r => r.sugerencia?.id === sugerencia.id);
      
      if (reporte) {
        setReporteInfo(reporte);
        setInfoReporteVisible(true);
      } else {
        message.error('No se encontró información del reporte');
      }
    } catch (error) {
      console.error('Error al obtener info del reporte:', error);
      message.error('Error al cargar información del reporte');
    } finally {
      setLoadingEliminarReporte(false);
    }
  };

  // Eliminar reporte (solo admin)
  const eliminarReporte = async () => {
    setLoadingEliminarReporte(true);
    
    try {
      console.log('🔄 Llamando a reportesService.eliminarReporte con id:', reporteInfo.id);
      const resultado = await reportesService.eliminarReporte(reporteInfo.id);
      console.log('✅ Respuesta del servicio:', resultado);
      
      message.success('Reporte eliminado exitosamente');
      setInfoReporteVisible(false);
      setReporteInfo(null);
      setConfirmandoEliminacion(false);
      
      console.log('🔄 Recargando lista de sugerencias...');
      await cargar();
      console.log('✅ Lista recargada');
      
    } catch (error) {
      console.error('❌ Error completo:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error response:', error.response?.data);
      message.error(error.message || 'Error al eliminar el reporte');
    } finally {
      setLoadingEliminarReporte(false);
    }
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
    { 
      title: 'Título', 
      dataIndex: 'titulo', 
      key: 'titulo', 
      render: (titulo, record) => (
        <div>
          <Text strong>{titulo}</Text>
          {record.isReportada && (
            <Tag color="orange" style={{ marginLeft: 8 }}>
              <ExclamationCircleOutlined /> Reportada
            </Tag>
          )}
        </div>
      )
    },
    { title: 'Categoría', dataIndex: 'categoria', key: 'categoria' },
    { title: 'Estado', dataIndex: 'estado', key: 'estado', render: e => <Tag color={tagColor(e)}>{e.toUpperCase()}</Tag> },
    { title: 'Fecha', dataIndex: 'createdAt', key: 'createdAt', render: f => f
        ? new Date(f).toLocaleString('es-CL', { year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false })
        : 'N/A' },
    {
      title: 'Mensaje',
      key: 'mensaje',
      align: 'center',
      render: (_, r) => (
        <Button icon={<MessageOutlined />} type='link' onClick={() => abrirVerMensaje(r)} />
      )
    },
    {
      title: 'Acciones', 
      key: 'acciones', 
      render: (_, r) => {
        if (esEstud) {
          return (
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                disabled={!tieneResp(r)}
                icon={<MessageOutlined />}
                type='link'
                style={{ color: '#52c41a' }}
                onClick={() => abrirVerRespuesta(r)}
              >
                Ver Respuesta
              </Button>
              {/* BOTÓN CORREGIDO: Mostrar estado de reporte en el botón */}
              {puedeReportar(r) ? (
                <Button
                  icon={<ExclamationCircleOutlined />}
                  type='link'
                  danger
                  size='small'
                  onClick={() => abrirReportar(r)}
                >
                  Reportar
                </Button>
              ) : (
                // Mostrar botón deshabilitado con tooltip informativo
                <Button
                  icon={<ExclamationCircleOutlined />}
                  type='link'
                  disabled
                  size='small'
                  title={
                    r.isReportada ? 'Sugerencia ya reportada' :
                    misReportes.includes(r.id) || misReportes.includes(String(r.id)) ? 'Ya reportaste esta sugerencia' :
                    r.autor?.id === usuario?.id ? 'No puedes reportar tu propia sugerencia' :
                    r.estado === 'archivada' ? 'No se puede reportar sugerencias archivadas' :
                    'No disponible'
                  }
                >
                  Reportar
                </Button>
              )}
            </div>
          );
        }
        if (esAdmin) {
          return (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Button
                disabled={!tieneResp(r)}
                icon={<MessageOutlined />}
                type='link'
                style={{ color: '#52c41a' }}
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
              {r.isReportada && (
                <Button
                  icon={<ExclamationCircleOutlined />}
                  type='link'
                  style={{ color: '#ff4d4f' }}
                  onClick={() => verInfoReporte(r)}
                  title="Ver información del reporte"
                >
                  !
                </Button>
              )}
            </div>
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

        {/* Modal para ver mensaje */}
        <Modal
          title="Mensaje de la Sugerencia"
          open={msgModalVisible}
          onCancel={() => setMsgModalVisible(false)}
          width={600}
          footer={<Button onClick={() => setMsgModalVisible(false)}>Cerrar</Button>}
        >
          <div
            style={{
              margin: '8px 0',
              padding: 12,
              backgroundColor: '#f5f5f5',
              borderRadius: 4
            }}
          >
            {mensajeActivo}
          </div>
          {msgFecha && (
            <Text type="secondary">
              Fecha: {new Date(msgFecha).toLocaleString('es-CL')}
            </Text>
          )}
          {msgAutor && (
            <Text
              type="secondary"
              style={{ display: 'block', marginTop: 4 }}
            >
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
          <div style={{ margin: '8px 0', padding:12, backgroundColor:'#f5f5f5', borderRadius:4 }}>
            {viewRespuesta}
          </div>
          {viewFecha && <Text type='secondary'>Fecha: {new Date(viewFecha).toLocaleString('es-CL')}</Text>}
          {viewAdmin && <Text type='secondary' style={{ display:'block', marginTop:4 }}>Respondido por: {viewAdmin.nombre} {viewAdmin.apellido}</Text>}
        </Modal>

        {/* Modal para reportar sugerencia */}
        <Modal
          title={`Reportar sugerencia: "${sugerenciaAReportar?.titulo || ''}"`}
          open={reportModalVisible}
          onCancel={() => setReportModalVisible(false)}
          footer={null}
          width={500}
          styles={{
            body: {
              padding: '20px',
              backgroundColor: '#ffffff'
            }
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: '14px', color: '#666666' }}>
              Selecciona el motivo por el cual deseas reportar esta sugerencia:
            </Text>
          </div>
          <Form form={reportForm} layout='vertical' onFinish={enviarReporte}>
            <Form.Item 
              name='motivo' 
              label={<span style={{ color: '#333333', fontWeight: '500' }}>Motivo del reporte</span>}
              rules={[{ required: true, message: 'Selecciona un motivo' }]}
            >
              <Select 
                placeholder="Selecciona el motivo del reporte"
                style={{
                  backgroundColor: '#ffffff'
                }}
                dropdownStyle={{
                  backgroundColor: '#ffffff'
                }}
              >
                <Option value="contenido_inapropiado">Contenido inapropiado</Option>
                <Option value="spam">Spam</Option>
                <Option value="lenguaje_ofensivo">Lenguaje ofensivo</Option>
                <Option value="informacion_falsa">Información falsa</Option>
                <Option value="duplicado">Duplicado</Option>
                <Option value="otro">Otro</Option>
              </Select>
            </Form.Item>
            <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
              <Button 
                onClick={() => setReportModalVisible(false)} 
                style={{ 
                  marginRight: 8,
                  backgroundColor: '#f5f5f5',
                  borderColor: '#d9d9d9',
                  color: '#666666'
                }}
              >
                Cancelar
              </Button>
              <Button 
                type='primary' 
                htmlType='submit' 
                loading={loadingReporte} 
                danger
                style={{
                  backgroundColor: '#ff4d4f',
                  borderColor: '#ff4d4f'
                }}
              >
                Enviar Reporte
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal para ver información del reporte (solo admin) */}
        <Modal
          title={`Información del Reporte - "${reporteInfo?.sugerencia?.titulo || ''}"`}
          open={infoReporteVisible}
          onCancel={() => setInfoReporteVisible(false)}
          footer={null}
          width={600}
        >
          {reporteInfo && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <Text strong>Motivo del reporte:</Text>
                <div style={{ marginTop: 8 }}>
                  <Tag color="red">
                    {reporteInfo.motivo === 'contenido_inapropiado' && 'Contenido inapropiado'}
                    {reporteInfo.motivo === 'spam' && 'Spam'}
                    {reporteInfo.motivo === 'lenguaje_ofensivo' && 'Lenguaje ofensivo'}
                    {reporteInfo.motivo === 'informacion_falsa' && 'Información falsa'}
                    {reporteInfo.motivo === 'duplicado' && 'Duplicado'}
                    {reporteInfo.motivo === 'otro' && 'Otro'}
                  </Tag>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <Text strong>Reportado por:</Text>
                <div style={{ marginTop: 4 }}>
                  <Text>{reporteInfo.usuario?.nombre} {reporteInfo.usuario?.apellido}</Text>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <Text strong>Fecha del reporte:</Text>
                <div style={{ marginTop: 4 }}>
                  <Text>{new Date(reporteInfo.createdAt).toLocaleString('es-CL')}</Text>
                </div>
              </div>

              {confirmandoEliminacion ? (
                <div style={{ 
                  marginBottom: 20,
                  padding: 16,
                  backgroundColor: '#fff2f0',
                  border: '1px solid #ffccc7',
                  borderRadius: 6
                }}>
                  <div style={{ marginBottom: 12 }}>
                    <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                    <Text strong style={{ color: '#ff4d4f' }}>
                      ¿Estás seguro de que quieres eliminar este reporte?
                    </Text>
                  </div>
                  <Text style={{ color: '#666' }}>
                    Esta acción no se puede deshacer.
                  </Text>
                  <div style={{ marginTop: 12, textAlign: 'right' }}>
                    <Button 
                      onClick={() => setConfirmandoEliminacion(false)}
                      style={{ marginRight: 8 }}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type='primary' 
                      danger
                      loading={loadingEliminarReporte}
                      onClick={eliminarReporte}
                    >
                      Sí, eliminar
                    </Button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'right', borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
                  <Button 
                    onClick={() => setInfoReporteVisible(false)} 
                    style={{ marginRight: 8 }}
                  >
                    Cerrar
                  </Button>
                  <Button 
                    type='primary' 
                    danger
                    onClick={() => setConfirmandoEliminacion(true)}
                    style={{
                      backgroundColor: '#ff4d4f',
                      borderColor: '#ff4d4f'
                    }}
                  >
                    Eliminar Reporte
                  </Button>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Modal para responder/editar (solo admin) */}
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