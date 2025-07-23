import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Select, 
  Space, 
  Typography, 
  Statistic, 
  Row, 
  Col, 
  Tag, 
  message, 
  Modal, 
  Spin,
  Empty,
  Pagination
} from 'antd';
import { 
  SearchOutlined, 
  SafetyOutlined, 
  UserOutlined, 
  UserDeleteOutlined, 
  BarChartOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { usuarioService } from '../services/usuarios.services.js';
import MainLayout from '../components/MainLayout.jsx';
const { Title, Text } = Typography;
const { Option } = Select;

const GestionUsuarios = () => {
  // Estados para datos principales
  const [usuarios, setUsuarios] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [cargando, setCargando] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  
  // Estados para filtros y paginación
  const [filtros, setFiltros] = useState({
    page: 1,
    limit: 10,
    rol: 'all',
    estado: 'all',
    search: ''
  });

  // Estados para paginación
  const [paginacion, setPaginacion] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  });

  // Estados para interacciones
  const [cambiandoRol, setCambiandoRol] = useState(null);
  
  // Estados para modal de confirmación
  const [modalVisible, setModalVisible] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  /**
   * Cargar estadísticas del sistema
   */
  const cargarEstadisticas = async () => {
    try {
      const response = await usuarioService.obtenerEstadisticas();
      setEstadisticas(response.data || {});
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      messageApi.error('Error al cargar estadísticas');
    }
  };

  /**
   * Cargar usuarios con filtros aplicados
   */
  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      
      const response = await usuarioService.obtenerUsuarios(filtros);
      
      if (response.ok && response.status === 'success') {
       
        setUsuarios(response.data.usuarios || []);
        
        // Manejo más robusto de la paginación
        const paginacionData = response.data.paginacion || {};
        const currentLimit = filtros.limit || 10;
        const currentPage = filtros.page || 1;
        const total = paginacionData.total || paginacionData.totalRecords || 0;
        const totalPages = Math.ceil(total / currentLimit);
        
        setPaginacion({
          currentPage: paginacionData.currentPage || paginacionData.page || currentPage,
          totalPages: paginacionData.totalPages || paginacionData.pages || totalPages,
          total: total,
          limit: paginacionData.limit || paginacionData.pageSize || currentLimit
        });
      } else {
        messageApi.error('No se pudieron cargar los usuarios');
      }
    } catch (error) {
      console.error('Error completo:', error);
      
      // Manejo específico de errores de Axios
      if (error.response) {
        // El servidor respondió con un código de error
        const { status, data } = error.response;
        console.error(`Error del servidor (${status}):`, data);
        
        if (status === 500) {
          messageApi.error(`Error del servidor: ${data.message || 'Error interno'}`);
        } else {
          messageApi.error(data.message || `Error del servidor (${status})`);
        }
      } else if (error.request) {
        // La petición se hizo pero no hubo respuesta
        console.error('No se recibió respuesta del servidor:', error.request);
        messageApi.error('No se pudo conectar con el servidor');
      } else {
        // Error en la configuración de la petición
        console.error('Error de configuración:', error.message);
        messageApi.error('Error en la petición: ' + error.message);
      }
      
      setUsuarios([]);
    } finally {
      setCargando(false);
    }
  };

  /**
   * Mostrar modal de confirmación para cambio de rol
   */
  const mostrarConfirmacionCambioRol = (usuarioId, nombreUsuario, rolActual) => {
    const nuevoRol = rolActual === 'administrador' ? 'estudiante' : 'administrador';
    
    setUsuarioSeleccionado({
      id: usuarioId,
      nombre: nombreUsuario,
      rolActual,
      nuevoRol
    });
    setModalVisible(true);
  };

  /**
   * Ejecutar cambio de rol de usuario
   */
  const ejecutarCambioRol = async () => {
    if (!usuarioSeleccionado) return;

    try {
      setModalVisible(false);
      setCambiandoRol(usuarioSeleccionado.id);
      
      const response = await usuarioService.alternarRolUsuario(usuarioSeleccionado.id);
      
      if (response.ok && response.status === 'success') {
        // Actualizar lista de usuarios
        await cargarUsuarios();
        // Actualizar estadísticas
        await cargarEstadisticas();
        
        messageApi.success(` ${response.data.cambio.mensaje}`);
      }
    } catch (error) {
      messageApi.error(` ${error.message}`);
    } finally {
      setCambiandoRol(null);
      setUsuarioSeleccionado(null);
    }
  };

  /**
   * Cancelar cambio de rol
   */
  const cancelarCambioRol = () => {
    setModalVisible(false);
    setUsuarioSeleccionado(null);
  };

  /**
   * Manejar cambios en filtros
   */
  const manejarCambioFiltro = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor,
      page: 1 // Resetear a primera página al cambiar filtros
    }));
  };

  /**
   * Manejar cambio de página
   */
  const cambiarPagina = (page, pageSize) => {
    setFiltros(prev => ({
      ...prev,
      page,
      limit: pageSize
    }));
  };

  /**
   * Resetear filtros
   */
  const resetearFiltros = () => {
    setFiltros({
      page: 1,
      limit: 10,
      rol: 'all',
      estado: 'all',
      search: ''
    });
    messageApi.info('Filtros reseteados');
  };

  /**
   * Cargar datos iniciales
   */
  useEffect(() => {
    cargarEstadisticas();
  }, []);

  /**
   * Cargar usuarios cuando cambien los filtros
   */
  useEffect(() => {
    cargarUsuarios();
  }, [filtros]);

  /**
   * Determinar color de tag por rol
   */
  const obtenerColorRol = (rol) => {
    switch (rol) {
      case 'administrador': return 'purple';
      case 'estudiante': return 'blue';
      case 'superadmin': return 'red';
      default: return 'default';
    }
  };

  /**
   * Determinar color de tag por estado
   */
  const obtenerColorEstado = (estado) => {
    return estado === 'activo' ? 'success' : 'error';
  };

  // Configuración de columnas para la tabla
  const columnas = [
    {
      title: 'Usuario',
      dataIndex: 'nombre',
      key: 'usuario',
      render: (nombre, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{nombre}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.correo}
          </Text>
        </div>
      ),
    },
    {
      title: 'Rol',
      dataIndex: ['rol', 'nombre'],
      key: 'rol',
      render: (rol) => (
        <Tag color={obtenerColorRol(rol)}>
          {rol || 'Sin rol'}
        </Tag>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado) => (
        <Tag color={obtenerColorEstado(estado)}>
          {estado}
        </Tag>
      ),
    },
    {
      title: 'Fecha Registro',
      dataIndex: 'createdAt',
      key: 'fecha',
      render: (fecha) => new Date(fecha).toLocaleDateString('es-ES'),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => {
        if (record.rol?.isSuperAdmin) {
          return <Text type="secondary" italic>No modificable</Text>;
        }

        const esAdmin = record.rol?.nombre === 'administrador';
        const nuevoRol = esAdmin ? 'Estudiante' : 'Administrador';

        return (
          <Button
            type="primary"
            size="small"
            loading={cambiandoRol === record.id}
            onClick={() => mostrarConfirmacionCambioRol(record.id, record.nombre, record.rol?.nombre)}
          >
            Cambiar a {nuevoRol}
          </Button>
        );
      },
    },
  ];

  return (
    <MainLayout>
      {contextHolder}
      <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <Title level={2} style={{ marginBottom: '8px', color: '#1e3a8a' }}>
              Gestión de Usuarios
            </Title>
            <Text type="secondary">
              Administra usuarios, roles y visualiza estadísticas del sistema
            </Text>
          </div>

          {/* Tarjetas de Estadísticas */}
          <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Usuarios"
                  value={estadisticas.totalUsuarios || 0}
                  prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Estudiantes Activos"
                  value={estadisticas.estudiantesActivos || 0}
                  prefix={<UserOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Administradores"
                  value={estadisticas.administradoresActivos || 0}
                  prefix={<SafetyOutlined style={{ color: '#722ed1' }} />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Nuevos (30 días)"
                  value={estadisticas.nuevosUsuariosTreintaDias || 0}
                  prefix={<BarChartOutlined style={{ color: '#fa8c16' }} />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Filtros y Búsqueda */}
          <Card style={{ marginBottom: '24px' }}>
            <Row gutter={[16, 16]} align="bottom">
              <Col xs={24} md={8}>
                <Text strong>Buscar Usuario</Text>
                <Input
                  placeholder="Buscar por nombre o email..."
                  prefix={<SearchOutlined />}
                  value={filtros.search}
                  onChange={(e) => manejarCambioFiltro('search', e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} md={5}>
                <Text strong>Filtrar por Rol</Text>
                <Select
                  style={{ width: '100%' }}
                  value={filtros.rol}
                  onChange={(value) => manejarCambioFiltro('rol', value)}
                >
                  <Option value="all">Todos los roles</Option>
                  <Option value="estudiante">Estudiante</Option>
                  <Option value="administrador">Administrador</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={5}>
                <Text strong>Filtrar por Estado</Text>
                <Select
                  style={{ width: '100%' }}
                  value={filtros.estado}
                  onChange={(value) => manejarCambioFiltro('estado', value)}
                >
                  <Option value="all">Todos los estados</Option>
                  <Option value="activo">Activo</Option>
                  <Option value="inactivo">Inactivo</Option>
                </Select>
              </Col>
              <Col xs={24} md={6}>
                <Space>
                  <Button icon={<ReloadOutlined />} onClick={resetearFiltros}>
                    Resetear Filtros
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

         

          {/* Tabla de Usuarios */}
          <Card
            title={
              <Title level={4} style={{ margin: 0 }}>
                Lista de Usuarios 
              </Title>
            }
          >
            <Spin spinning={cargando}>
              <Table
                columns={columnas}
                dataSource={usuarios}
                rowKey="id"
                pagination={false}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="No se encontraron usuarios"
                    />
                  )
                }}
              />
              
              {/* Paginación personalizada - Condición mejorada */}
              {(paginacion.total > paginacion.limit || paginacion.totalPages > 1) && (
                <div style={{ marginTop: '16px', textAlign: 'right' }}>
                  <Pagination
                    current={paginacion.currentPage}
                    total={paginacion.total}
                    pageSize={paginacion.limit}
                    showSizeChanger
                    showQuickJumper
                    showTotal={(total, range) =>
                      `${range[0]}-${range[1]} de ${total} usuarios`
                    }
                    onChange={cambiarPagina}
                    onShowSizeChange={cambiarPagina}
                    pageSizeOptions={['5', '10', '20', '50']}
                  />
                </div>
              )}
            </Spin>
          </Card>

          {/* Modal de Confirmación para Cambio de Rol */}
          <Modal
            title="Confirmar Cambio de Rol"
            open={modalVisible}
            onOk={ejecutarCambioRol}
            onCancel={cancelarCambioRol}
            okText="Sí, cambiar"
            cancelText="Cancelar"
            icon={<ExclamationCircleOutlined />}
          >
            {usuarioSeleccionado && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '16px' }} />
                <span>
                  ¿Deseas cambiar el rol de <strong>{usuarioSeleccionado.nombre}</strong> a{' '}
                  <strong>{usuarioSeleccionado.nuevoRol}</strong>?
                </span>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </MainLayout>
  );
};

export default GestionUsuarios;