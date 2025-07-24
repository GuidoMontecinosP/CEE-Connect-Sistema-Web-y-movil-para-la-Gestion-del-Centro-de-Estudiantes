import { useEffect, useState, useRef } from "react";
import axios from "../services/root.services";
import { useParams } from "react-router-dom";
import { Card, Button, Spin, Result, Typography } from 'antd';
import { CheckCircleOutlined, WarningOutlined, CloseCircleOutlined, SafetyOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

function Verificado() {
  const { token } = useParams();
  const [estado, setEstado] = useState("cargando");
  const hasVerified = useRef(false); // Ref para evitar doble ejecución

  useEffect(() => {
    if (!token || hasVerified.current) {
      if (!token) {
        console.log("No hay token");
        setEstado("invalido");
      }
      return;
    }
    
    hasVerified.current = true; // Marcar como ejecutado
    
    axios
      .get(`/auth/verificar/${token}`)
      .then((response) => {
        console.log("Respuesta exitosa:", response);
        console.log("response.data:", response.data);
       
        // Verificar si ya estaba verificado anteriormente
        if (response.data.already_verified) {
          setEstado("ya_verificado");
        } else {
          setEstado("verificado");
        }
      })
      .catch((error) => {
        console.log("Error completo:", error);
        console.log("Mensaje de error:", error.message);        
        setEstado("invalido");
      });
  }, [token]);

  const handleRedirect = (path) => {
    window.location.href = path;
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  };

  const cardStyle = {
    maxWidth: '450px',
    width: '100%',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    border: 'none',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '32px',
    padding: '24px 24px 0'
  };

  const logoStyle = {
    width: '80px',
    height: '80px',
    background: 'linear-gradient(135deg, #60a5fa, #34d399)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    boxShadow: '0 8px 20px rgba(96, 165, 250, 0.3)'
  };

  if (estado === "cargando") {
    return (
      <div style={containerStyle}>
        <Card style={cardStyle}>
          <div style={headerStyle}>
            
            <Title level={2} style={{ color: '#1e3a8a', marginBottom: '8px' }}>
              CEE Connect
            </Title>
            <Paragraph style={{ color: '#64748b', margin: 0 }}>
              Verificación de cuenta
            </Paragraph>
          </div>
          
          <div style={{ textAlign: 'center', padding: '0 24px 24px' }}>
            <Spin size="large" style={{ marginBottom: '24px' }} />
            <Title level={3} style={{ color: '#1e3a8a', marginBottom: '8px' }}>
              Verificando enlace...
            </Title>
            <Paragraph style={{ color: '#64748b' }}>
              Por favor espera un momento
            </Paragraph>
          </div>
        </Card>
      </div>
    );
  }

  if (estado === "verificado") {
    return (
      <div style={containerStyle}>
        <Card style={cardStyle}>
          <div style={headerStyle}>
           
            <Title level={2} style={{ color: '#1e3a8a', marginBottom: '8px' }}>
              CEE Connect
            </Title>
            <Paragraph style={{ color: '#64748b', margin: 0 }}>
              Verificación de cuenta
            </Paragraph>
          </div>

          <Result
            icon={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '72px' }} />}
            title={
              <Title level={2} style={{ color: '#1e3a8a', marginBottom: '16px' }}>
                ¡Cuenta verificada!
              </Title>
            }
            subTitle={
              <div>
                <Paragraph style={{ color: '#64748b', marginBottom: '8px' }}>
                  Tu cuenta ha sido verificada correctamente.
                </Paragraph>
                <Paragraph style={{ color: '#64748b', marginBottom: '16px' }}>
                  Ahora puedes iniciar sesión en CEE Connect.
                </Paragraph>
              </div>
            }
            extra={
              <Button 
                type="primary" 
                size="large"
                style={{ 
                  background: '#52c41a',
                  borderColor: '#52c41a',
                  borderRadius: '8px',
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
                onClick={() => handleRedirect("/login")}
              >
                Ir a Login
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  if (estado === "ya_verificado") {
    return (
      <div style={containerStyle}>
        <Card style={cardStyle}>
          <div style={headerStyle}>
           
            <Title level={2} style={{ color: '#1e3a8a', marginBottom: '8px' }}>
              CEE Connect
            </Title>
            <Paragraph style={{ color: '#64748b', margin: 0 }}>
              Verificación de cuenta
            </Paragraph>
          </div>

          <Result
            icon={<WarningOutlined style={{ color: '#fa8c16', fontSize: '72px' }} />}
            title={
              <Title level={2} style={{ color: '#1e3a8a', marginBottom: '16px' }}>
                Cuenta ya verificada
              </Title>
            }
            subTitle={
              <div>
                <Paragraph style={{ color: '#64748b', marginBottom: '8px' }}>
                  Tu cuenta ya había sido verificada anteriormente.
                </Paragraph>
                <Paragraph style={{ color: '#64748b', marginBottom: '16px' }}>
                  Puedes proceder a iniciar sesión en CEE Connect.
                </Paragraph>
              </div>
            }
            extra={
              <Button 
                type="primary" 
                size="large"
                style={{ 
                  background: '#fa8c16',
                  borderColor: '#fa8c16',
                  borderRadius: '8px',
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
                onClick={() => handleRedirect("/login")}
              >
                Ir a Login
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  if (estado === "invalido") {
    return (
      <div style={containerStyle}>
        <Card style={cardStyle}>
          <div style={headerStyle}>
          
            <Title level={2} style={{ color: '#1e3a8a', marginBottom: '8px' }}>
              CEE Connect
            </Title>
            <Paragraph style={{ color: '#64748b', margin: 0 }}>
              Verificación de cuenta
            </Paragraph>
          </div>

          <Result
            icon={<CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '72px' }} />}
            title={
              <Title level={2} style={{ color: '#1e3a8a', marginBottom: '16px' }}>
                Enlace inválido
              </Title>
            }
            subTitle={
              <div>
                <Paragraph style={{ color: '#64748b', marginBottom: '8px' }}>
                  El enlace ha expirado o no es válido.
                </Paragraph>
                <Paragraph style={{ color: '#64748b', marginBottom: '16px' }}>
                  Por favor vuelve a registrarte o solicita un nuevo enlace.
                </Paragraph>
              </div>
            }
            extra={
              <Button 
                type="primary" 
                size="large"
                style={{ 
                  background: '#ff4d4f',
                  borderColor: '#ff4d4f',
                  borderRadius: '8px',
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
                onClick={() => handleRedirect("/register")}
              >
                Volver a Registro
              </Button>
            }
          />
          
          <div style={{ 
            textAlign: 'center', 
            marginTop: '24px', 
            paddingTop: '24px', 
            borderTop: '1px solid #f0f0f0' 
          }}>
       
          </div>
        </Card>
      </div>
    );
  }

  return null;
}

export default Verificado;