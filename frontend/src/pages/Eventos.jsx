import React, { useEffect, useState } from "react";

import { MdEvent, MdDescription, MdPlace, MdLabel } from 'react-icons/md'

import { obtenerEventos} from "../services/eventos.services.js";

import MainLayout from '../components/MainLayout.jsx';
import { Breadcrumb, 
         Card,
         Typography
} from 'antd';

const { Title, Text } = Typography;

function Eventos (){
    const [eventos, setEventos] = useState([]);

    useEffect(() => {
        obtenerEventos()
          .then(res => setEventos(res))
          .catch(err => alert(err.message));
    }, []);

    return (
        <MainLayout
            breadcrumb={<Breadcrumb style={{ margin: '14px 0' }} items={[{ title: 'Eventos' }]} />}
        >
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Title level={1} style={{ color: '#1e3a8a', marginBottom: 8 }}>
              Listado de Eventos
            </Title>
            <Text style={{ fontSize: 16, color: '#64748b' }}>
              Aquí podras encontrar los proximos eventos, podras ver el tipo, descripcion, fecha y lugar de encuentro.
            </Text>
          </div>
        
            {eventos.length === 0 ? (
              <p>No hay eventos registrados.</p>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                flexWrap: 'wrap',
                gap: 30,
                marginTop: 24,
                marginLeft: '20px',
                
                }}>
                {eventos.map(e => {
                  // Formatear fecha de YYYY-MM-DD a DD-MM-YYYY
                  let fechaFormateada = e.fecha ? e.fecha.split('-').reverse().join('-') : '';
                  return (
                    <Card key={e.id} size="small" title={e.titulo} 
                    style={{ width: 300, boxShadow: '5px 10px 15px rgba(0,0,0,0.1)', }}>
                     <MdDescription/> Descripción: {e.descripcion} <br />
                     <MdEvent /> Fecha: {fechaFormateada} - Hora: {e.hora ?? ''}  <br />
                      <MdPlace />Lugar: {e.lugar} <br />
                     <MdLabel/> Tipo: {e.tipo} <br />
                    </Card>
                  );
                })}
              </div>
            )}
        </MainLayout>
    );
}

export default Eventos;