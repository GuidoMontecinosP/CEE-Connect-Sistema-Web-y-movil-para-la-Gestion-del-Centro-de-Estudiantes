import { useState } from "react";
import axios from "../services/root.services";
import { useNavigate } from "react-router-dom";
import ubbFondo from "../assets/portal.png";
import {message} from 'antd'
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

export default function Register() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [passwordStrength, setPasswordStrength] = useState("");
  const [messageApi, contextHolder] = message.useMessage();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (contrasena !== confirmarContrasena) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      await axios.post("/auth/register", {
        nombre,
        correo,
        contrasena,
        rolId: 2,
      });

      messageApi.success({
        content: "Registro exitoso. Revisa tu correo institucional.",
        duration: 1.5,
        onClose: () => {
          navigate("/login");
        }
      });

    } catch (err) {
      console.log("Error de registro:" , err.response?.data?.details);   
      messageApi.error({
        content: err.response?.data?.details || "Error al registrarse",
        duration: 3,
      })
    }
  };

  return (
    <>
      {contextHolder}
      <div style={{ display: "flex", height: "100vh", fontFamily: "Segoe UI, sans-serif" }}>
        {/* Imagen izquierda */}
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

        {/* Formulario */}
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
            src="/src/assets/escudo-color-gradiente-oscuro.png"
            alt="Logo UBB"
            style={{ width: "220px", marginBottom: "0.5rem" }}
          />

          <h1 style={{ color: "#1e3a8a", marginBottom: "0.5rem", fontWeight: 700 }}>
            Registrarse
          </h1>

          <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "360px" }}>
            <label>Nombre completo</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Bastián Andrés Baeza Sánchez"
              required
              style={inputStyle}
            />

            <label>Correo institucional</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="usuario@alumnos.ubiobio.cl"
              pattern=".+@alumnos\.ubiobio\.cl"
              required
              style={inputStyle}
              title="El correo debe ser institucional @alumnos.ubiobio.cl"
            />

            <label>Contraseña</label>
            <div style={passwordContainerStyle}>
              <input
                type={showPassword ? "text" : "password"}
                value={contrasena}
                onChange={(e) => {
                  setContrasena(e.target.value);
                  setPasswordStrength(getPasswordStrength(e.target.value));
                }}
                required
                style={passwordInputStyle}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={eyeButtonStyle}
              >
                {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              </button>
            </div>

            {contrasena && (
              <div style={{ marginTop: "-0.8rem", marginBottom: "1rem", fontSize: "13px", color: getColorStrength(passwordStrength) }}>
                Seguridad: {passwordStrength}
              </div>
            )}

            <label>Confirmar contraseña</label>
            <div style={passwordContainerStyle}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                required
                style={passwordInputStyle}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={eyeButtonStyle}
              >
                {showConfirmPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              </button>
            </div>

            {error && (
              <div style={{ color: "crimson", fontSize: "14px", marginTop: "10px" }}>
                {error}
              </div>
            )}

            <button type="submit" style={buttonStyle}>
              Registrarse
            </button>
          </form>

          <p style={{ marginTop: "1.5rem", fontSize: "14px", color: "#666" }}>
            ¿Ya tienes una cuenta?{" "}
            <a href="/login" style={{ color: "#1e3a8a", fontWeight: "bold" }}>
              Inicia sesión aquí
            </a>
          </p>
        </div>
      </div>
    </>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "1rem",
  borderRadius: "6px",
  border: "1px solid #ccc",
  lineHeight: "1.5",
};

const passwordContainerStyle = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  marginBottom: "1rem",
};

const passwordInputStyle = {
  width: "100%",
  padding: "10px",
  paddingRight: "40px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  lineHeight: "1.5",
};

const eyeButtonStyle = {
  position: "absolute",
  right: "10px",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#666",
  fontSize: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0",
  zIndex: 1,
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#1e3a8a",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontWeight: "bold",
  fontSize: "16px",
  cursor: "pointer",
};

function getPasswordStrength(password) {
  if (password.length < 8) return "débil";
  if (!/[A-Z]/.test(password)) return "media";
  if (!/[0-9]/.test(password)) return "media";
  if (!/[!@#$%^&*]/.test(password)) return "media";
  return "fuerte";
}

function getColorStrength(strength) {
  switch (strength) {
    case "débil": return "crimson";
    case "media": return "#e69b00";
    case "fuerte": return "limegreen";
    default: return "#333";
  }
}