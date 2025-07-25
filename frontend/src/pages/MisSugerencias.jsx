import React, { useEffect, useState } from 'react';
import {
  Table, Typography, Input, Tag, Spin, Button, Modal, Tooltip, Space, Popconfirm, message, Breadcrumb, Select
} from 'antd';
import {
  MessageOutlined, SearchOutlined, EditOutlined, DeleteOutlined, HomeOutlined, UserOutlined, ClearOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { sugerenciasService } from '../services/sugerencia.services.js';
import MainLayout from '../components/MainLayout';    

const { Title, Text } = Typography;
const { Option } = Select;

export default function MisSugerencias() {
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [mensajeActivo, setMensajeActivo] = useState(null);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleString('es-CL', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
  };

  // Función para determinar si fue editada
  const fueEditada = (createdAt, updatedAt) => {
    if (!createdAt || !updatedAt) return false;
    const created = new Date(createdAt).getTime();
    const updated = new Date(updatedAt).getTime();
    return updated > created;
  };

  // Función para limpiar todos los filtros
  const limpiarFiltros = () => {
    setSearchText('');
    setCategoriaFiltro('');
    setEstadoFiltro('');
  };

  // Función para eliminar sugerencia
  const eliminarSugerencia = async (id, titulo) => {
    try {
      setEliminandoId(id);
      await sugerenciasService.eliminarSugerencia(id);
      
      // Actualizar la lista local eliminando la sugerencia
      setSugerencias(prevSugerencias => 
        prevSugerencias.filter(s => s.id !== id)
      );
      
      messageApi.success(`Sugerencia "${titulo}" eliminada exitosamente`);
    } catch (error) {
      console.error("Error al eliminar sugerencia:", error);
      messageApi.error(error.message || 'Error al eliminar la sugerencia');
    } finally {
      setEliminandoId(null);
    }
  };

  useEffect(() => {
    const cargarMisSugerencias = async () => {
      try {
        const res = await sugerenciasService.obtenerMisSugerencias();
        setSugerencias(res.data.data || []);
      } catch (error) {
        console.error("Error al obtener mis sugerencias:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarMisSugerencias();
  }, []);

  // Filtrado mejorado que incluye búsqueda, categoría y estado
  const filtered = sugerencias.filter(s => {
    const textoCoincide = !searchText || 
      `${s.titulo} ${s.categoria} ${s.estado}`.toLowerCase().includes(searchText.toLowerCase());
    
    const categoriaCoincide = !categoriaFiltro || s.categoria === categoriaFiltro;
    const estadoCoincide = !estadoFiltro || s.estado === estadoFiltro;
    
    return textoCoincide && categoriaCoincide && estadoCoincide;
  });

  // Obtener categorías únicas para el filtro
  const categoriasUnicas = [...new Set(sugerencias.map(s => s.categoria))].filter(Boolean);
  
  // Estados disponibles
  const estadosDisponibles = ['pendiente', 'en proceso', 'resuelta'];

  const columns = [
    {
      title: 'Título',
      dataIndex: 'titulo',
      key: 'titulo'
    },
    {
      title: 'Categoría',
      dataIndex: 'categoria',
      key: 'categoria',
      render: (categoria) => {
        if (!categoria) return 'N/A';
        return categoria.charAt(0).toUpperCase() + categoria.slice(1).toLowerCase();
      }

    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado) => {
        const colores = {
          pendiente: 'orange',
          'en proceso': 'blue',
          resuelta: 'green',
          archivada: 'default'
        };
        return <Tag color={colores[estado] || 'default'}>{estado.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Fecha',
      key: 'fecha',
      render: (_, record) => {
        const editada = fueEditada(record.createdAt, record.updatedAt);
        const fechaMostrar = editada ? record.updatedAt : record.createdAt;
        
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {editada && (
                <Tooltip title="Esta sugerencia fue editada">
                  <EditOutlined style={{ color: '#1890ff', fontSize: 12 }} />
                </Tooltip>
              )}
              <Text style={{ fontSize: 12 }}>
                {formatearFecha(fechaMostrar)}
              </Text>
            </div>
            {editada && (
              <Text type="secondary" style={{ fontSize: 10 }}>
                Creada: {formatearFecha(record.createdAt)}
              </Text>
            )}
          </div>
        );
      }
    },
    {
      title: 'Mensaje',
      key: 'mensaje',
      render: (_, record) => (
        <Button
          icon={<MessageOutlined />} 
          type="link"
          onClick={() => {
            setMensajeActivo(record.mensaje);
            setModalVisible(true);
          }}
        >
          Ver
        </Button>
      )
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />} 
            type="link"
            onClick={() => navigate(`/sugerencias/${record.id}/editar`, {
              state: { sugerencia: record }
            })}
          >
            Editar
          </Button>
          
          <Popconfirm
            title="¿Eliminar sugerencia?"
            description={`¿Estás seguro de que quieres eliminar "${record.titulo}"?`}
            onConfirm={() => eliminarSugerencia(record.id, record.titulo)}
            okText="Sí, eliminar"
            cancelText="Cancelar"
            okType="danger"
          >
            <Button
              icon={<DeleteOutlined />}
              type="link"
              danger
              loading={eliminandoId === record.id}
              style={{ color: '#ff4d4f' }}
            >
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <MainLayout
      breadcrumb
    >
      {contextHolder}
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Title level={2} style={{ color: '#1e3a8a', marginBottom: 24 }}>
          Mis Sugerencias
        </Title>

        {/* Barra de filtros */}
        <div style={{ 
          display: 'flex', 
          gap: 16, 
          marginBottom: 16, 
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <Input
            placeholder="Buscar sugerencias..."
            prefix={<SearchOutlined style={{ color: '#1e3a8a' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300, borderRadius: 8 }}
            allowClear
          />
<Select
            placeholder="Filtrar por categoría"
            style={{ width: 200 }}
            value={categoriaFiltro || undefined}
            onChange={setCategoriaFiltro}
            allowClear
          >
            {categoriasUnicas.map(categoria => (
              <Option key={categoria} value={categoria}>
                {categoria ? categoria.charAt(0).toUpperCase() + categoria.slice(1).toLowerCase() : 'N/A'}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Filtrar por estado"
            style={{ width: 200 }}
            value={estadoFiltro || undefined}
            onChange={setEstadoFiltro}
            allowClear
          >
            {estadosDisponibles.map(estado => (
              <Option key={estado} value={estado}>
                <Tag color={
                  estado === 'pendiente' ? 'orange' :
                  estado === 'en proceso' ? 'blue' :
                  estado === 'resuelta' ? 'green' : 'default'
                }>
                  {estado.toUpperCase()}
                </Tag>
              </Option>
            ))}
          </Select>

          {(searchText || categoriaFiltro || estadoFiltro) && (
            <Button
              icon={<ClearOutlined />}
              onClick={limpiarFiltros}
              title="Limpiar filtros"
            >
              Limpiar filtros
            </Button>
          )}
        </div>

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
            dataSource={filtered}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            bordered
            locale={{
              emptyText: filtered.length === 0 && sugerencias.length > 0 
                ? 'No se encontraron sugerencias con los filtros aplicados'
                : 'Aún no has creado ninguna sugerencia',
            }}
          />
        )}

        <Modal
          title="Mensaje de la sugerencia"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          <p>{mensajeActivo}</p>
        </Modal>
      </div>
    </MainLayout>
  );
}