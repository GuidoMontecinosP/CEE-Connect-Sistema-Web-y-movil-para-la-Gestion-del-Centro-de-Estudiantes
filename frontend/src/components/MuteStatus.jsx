import React, { useState, useEffect } from 'react';
import { Card, Typography, Progress, Tag } from 'antd';
import { ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

const MuteStatus = ({ muteoInfo }) => {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    if (!muteoInfo) return;

    const updateTimer = () => {
      const now = new Date();
      const startDate = new Date(muteoInfo.fecha_inicio);
      const endDate = new Date(muteoInfo.fecha_fin);
      const totalDuration = endDate - startDate;
      const elapsed = now - startDate;
      const remaining = endDate - now;

      // Calcular porcentaje transcurrido
      const percent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
      setProgressPercent(percent);

      if (remaining <= 0) {
        setTimeRemaining('Muteo expirado');
        return;
      }

      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      let timeStr = '';
      if (days > 0) {
        timeStr = `${days}d ${hours}h ${minutes}m`;
      } else if (hours > 0) {
        timeStr = `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        timeStr = `${minutes}m ${seconds}s`;
      } else {
        timeStr = `${seconds}s`;
      }

      setTimeRemaining(timeStr);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [muteoInfo]);

  if (!muteoInfo) return null;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const isExpired = new Date() >= new Date(muteoInfo.fecha_fin);

  return (
    <Card
      style={{
        borderRadius: 12,
        border: `2px solid ${isExpired ? '#52c41a' : '#faad14'}`,
        backgroundColor: isExpired ? '#f6ffed' : '#fffbf0',
        marginBottom: 16
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: 16 }}>
          {isExpired ? (
            <Tag color="success" icon={<ClockCircleOutlined />} style={{ fontSize: 14, padding: '4px 12px' }}>
              MUTEO EXPIRADO
            </Tag>
          ) : (
            <Tag color="warning" icon={<ExclamationCircleOutlined />} style={{ fontSize: 14, padding: '4px 12px' }}>
              CUENTA MUTEADA
            </Tag>
          )}
        </div>

        <Title level={4} style={{ color: isExpired ? '#389e0d' : '#d46b08', marginBottom: 8 }}>
          {isExpired ? 'Tu cuenta ha sido reactivada' : 'Acceso Restringido'}
        </Title>

        <div style={{ marginBottom: 20 }}>
          <Text strong style={{ color: '#595959' }}>Razón: </Text>
          <Text style={{ color: '#262626' }}>{muteoInfo.razon}</Text>
        </div>

        {!isExpired && (
          <div style={{ marginBottom: 20 }}>
            <Text strong style={{ display: 'block', marginBottom: 8, color: '#d46b08' }}>
              <ClockCircleOutlined style={{ marginRight: 8 }} />
              Tiempo restante: {timeRemaining}
            </Text>
            <Progress
              percent={progressPercent}
              showInfo={false}
              strokeColor={{
                '0%': '#faad14',
                '50%': '#fa8c16',
                '100%': '#fa541c',
              }}
              trailColor="#f0f0f0"
              style={{ marginBottom: 12 }}
            />
          </div>
        )}

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: 16, 
          fontSize: 12, 
          color: '#8c8c8c',
          textAlign: 'left',
          padding: '12px 0',
          borderTop: '1px solid #f0f0f0',
          marginTop: 12
        }}>
          <div>
            <Text strong style={{ display: 'block', color: '#595959' }}>Inicio:</Text>
            <Text>{formatDate(muteoInfo.fecha_inicio)}</Text>
          </div>
          <div>
            <Text strong style={{ display: 'block', color: '#595959' }}>Fin:</Text>
            <Text>{formatDate(muteoInfo.fecha_fin)}</Text>
          </div>
        </div>

        {isExpired && (
          <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f' }}>
            <Text style={{ color: '#389e0d' }}>
               Puedes volver a crear y editar sugerencias
            </Text>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MuteStatus;
