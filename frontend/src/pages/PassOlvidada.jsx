import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {authService} from "../services/auth.services.js";
import { ArrowLeftOutlined, MailOutlined, CheckCircleOutlined } from '@ant-design/icons';

export default function PassOlvidada() {
  const [correo, setCorreo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await authService.recuperarContrasena({ correo });
      setSuccess(true);
    } catch (error) {
      console.log("Error al recuperar contraseña:", error);
      setError(error.message || "Error al enviar correo de recuperación");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <CheckCircleOutlined style={{ fontSize: "48px", color: "#22c55e", marginBottom: "1rem" }} />
            <h1 style={{ color: "#1e3a8a", marginBottom: "1rem", fontWeight: 700 }}>
              ¡Correo enviado!
            </h1>
            <p style={{ color: "#666", fontSize: "16px", lineHeight: "1.5" }}>
              Hemos enviado un enlace de recuperación a <strong>{correo}</strong>
            </p>
            <p style={{ color: "#666", fontSize: "14px", marginTop: "1rem" }}>
              Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
            </p>
          </div>

          <button
            onClick={() => navigate("/login")}
            style={buttonStyleBlue}
          >
            Volver al inicio de sesión
          </button>

          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <button
              onClick={() => {
                setSuccess(false);
                setCorreo("");
                setError("");
              }}
              style={linkButtonStyle}
            >
              ¿No recibiste el correo? Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <button
          onClick={() => navigate("/login")}
          style={backButtonStyle}
        >
          <ArrowLeftOutlined /> Volver
        </button>

        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <MailOutlined style={{ fontSize: "48px", color: "#1e3a8a", marginBottom: "1rem" }} />
          <h1 style={{ color: "#1e3a8a", marginBottom: "1rem", fontWeight: 700 }}>
            Recuperar contraseña
          </h1>
          <p style={{ color: "#666", fontSize: "16px" }}>
            Ingresa tu correo institucional y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>
            Correo institucional
          </label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="usuario@alumnos.ubiobio.cl"
            pattern=".+@alumnos\.ubiobio\.cl"
            required
            disabled={loading}
            style={inputStyle}
          />

          {error && (
            <div style={errorStyle}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || !correo}
            style={{
              ...buttonStyleBlue,
              opacity: (loading || !correo) ? 0.6 : 1,
              cursor: (loading || !correo) ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Enviando..." : "Enviar enlace de recuperación"}
          </button>
        </form>
      </div>
    </div>
  );
}

// === Estilos ===

const containerStyle = {
  display: "flex",
  height: "100vh",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#f8fafc",
  fontFamily: "Segoe UI, sans-serif",
  padding: "20px"
};

const cardStyle = {
  backgroundColor: "#ffffff",
  padding: "40px",
  borderRadius: "12px",
  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
  width: "100%",
  maxWidth: "400px",
  position: "relative"
};

const backButtonStyle = {
  position: "absolute",
  top: "20px",
  left: "20px",
  background: "none",
  border: "none",
  color: "#1e3a8a",
  fontSize: "14px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px"
};

const labelStyle = {
  marginBottom: "8px",
  display: "block",
  color: "#333",
  fontWeight: "500"
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "1.5rem",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "16px",
  lineHeight: "1.5",
  transition: "border-color 0.3s",
  boxSizing: "border-box"
};

const buttonStyleBlue = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#1e3a8a",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontWeight: "bold",
  fontSize: "16px",
  cursor: "pointer",
  transition: "background-color 0.3s",
};

const linkButtonStyle = {
  background: "none",
  border: "none",
  color: "#1e3a8a",
  fontSize: "14px",
  textDecoration: "underline",
  cursor: "pointer",
  padding: "8px"
};

const errorStyle = {
  color: "crimson",
  fontSize: "14px",
  marginBottom: "1rem",
  padding: "10px",
  backgroundColor: "#ffeaea",
  borderRadius: "4px",
  border: "1px solid #ffcdd2"
};