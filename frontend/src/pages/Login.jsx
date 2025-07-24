import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/root.services.js";
import { useAuth } from "../context/AuthContext";
import ubbFondo from "../assets/portal.png";
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
export default function Login() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
    try {
      const response = await axios.post("/auth/login",  {
        correo,
        contrasena
      });

      const { token, user } = response.data.data; 
      
      login(user, token);
      navigate("/noticias");
      
    } catch (error) {
    
      console.log("Error al iniciar sesión:", error.response.data.details);
      setError(error.response.data.details || "Error al iniciar sesión. Por favor, inténtalo de nuevo.");
     
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Segoe UI, sans-serif" }}>
      {/* Fondo con imagen UBB */}
      <div
        style={{
          flex: 2,
          backgroundImage: `url(${ubbFondo})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          filter: "brightness(1.5)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            zIndex: 1,
          }}
        />
      </div>

      {/* Formulario de login */}
      <div
        style={{
          flex: 1,
          padding: "60px 40px",
          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 2,
        }}
      >
        <img
          src="/escudo-color-gradiente-oscuro.png"
          alt="Logo UBB"
          style={{ width: "220px", }}
        />

        <h1 style={{ color: "#1e3a8a", marginBottom: "2rem", fontWeight: 700 }}>
          Iniciar sesión
        </h1>

        <form onSubmit={handleLogin} style={{ width: "100%", maxWidth: "360px" }}>
          <label style={{ marginBottom: "8px", display: "block", color: "#333" }}>
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

          <label style={{ marginBottom: "8px", display: "block", color: "#333" }}>
            Contraseña
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="********"
              required
              disabled={loading}
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "12px",
               
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#666",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "24px",
                height: "24px"

              }}
            >
               {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            </button>
          </div>
               <div style={{ textAlign: "right", marginBottom: "1rem" }}>
            <button
              type="button"
              onClick={() => navigate("/recuperar-contrasena")}
              disabled={loading}
              style={{
                background: "none",
                border: "none",
                color: "#1e3a8a",
                fontSize: "14px",
                textDecoration: "underline",
                cursor: "pointer",
                padding: "0"
              }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          {error && (
            <div style={{ 
              color: "crimson", 
              fontSize: "14px", 
              marginBottom: "1rem",
              padding: "10px",
              backgroundColor: "#ffeaea",
              borderRadius: "4px",
              border: "1px solid #ffcdd2"
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...buttonStyleBlue,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/register")}
            disabled={loading}
            style={{
              ...buttonStyleOutline,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            Registrarse
          </button>
        </form>

        <h2 style={{ fontSize: "26px", textAlign: "center", marginTop: "4rem", color: "#1e3a8a" }}>
          ¡Bienvenido a <br /> CEE Connect!
        </h2>
      </div>
    </div>
  );
}

// === Estilos reutilizables ===

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "1.5rem",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "16px",
  lineHeight: "1.5",
  transition: "border-color 0.3s",
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

const buttonStyleOutline = {
  marginTop: "1rem",
  width: "100%",
  padding: "12px",
  backgroundColor: "transparent",
  color: "#1e3a8a",
  border: "1px solid #1e3a8a",
  borderRadius: "6px",
  fontWeight: "bold",
  fontSize: "16px",
  cursor: "pointer",
  transition: "all 0.3s",
};