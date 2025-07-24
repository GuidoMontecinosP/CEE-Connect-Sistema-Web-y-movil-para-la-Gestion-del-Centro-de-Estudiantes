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
  const [showPasswordTooltip, setShowPasswordTooltip] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validar que las contraseñas coincidan
    if (contrasena !== confirmarContrasena) {
      setError("Las contraseñas no coinciden");
      return;
    }

    // Validar fortaleza de la contraseña
    const passwordValidation = validatePassword(contrasena);
    if (!passwordValidation.isValid) {
      setError(`La contraseña debe cumplir: ${passwordValidation.missingRequirements.join(", ")}`);
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
            padding: "40px 40px",
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
            style={{ width: "220px", marginBottom: "0.5rem" }}
          />

          <h1 style={{ color: "#1e3a8a", marginBottom: "0.5rem", marginTop: "-0.5rem", fontWeight: 700 }}>
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
                placeholder="********"
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

            {/* Barra de progreso con ícono de info */}
            {contrasena && (
              <div style={{ marginTop: "-0.8rem", marginBottom: "1rem" }}>
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  marginBottom: "6px"
                }}>
                  <div style={{ fontSize: "13px", color: getColorStrength(passwordStrength) }}>
                    Seguridad: {passwordStrength}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {validatePassword(contrasena).score}/5
                    </div>
                    {!validatePassword(contrasena).isValid && (
                      <div 
                        style={infoIconStyle}
                        onMouseEnter={() => setShowPasswordTooltip(true)}
                        onMouseLeave={() => setShowPasswordTooltip(false)}
                      >
                        !
                        {showPasswordTooltip && (
                          <div style={tooltipStyle}>
                            <div style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "8px", color: "#333" }}>
                              Faltan requisitos:
                            </div>
                            {validatePassword(contrasena).missingRequirements.map((req, index) => (
                              <div key={index} style={{ fontSize: "12px", color: "#666", marginBottom: "2px" }}>
                                • {req}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{
                  width: "100%",
                  height: "6px",
                  backgroundColor: "#e0e0e0",
                  borderRadius: "3px",
                  overflow: "hidden"
                }}>
                  <div style={{
                    width: `${(validatePassword(contrasena).score / 5) * 100}%`,
                    height: "100%",
                    backgroundColor: getProgressColor(validatePassword(contrasena).score),
                    transition: "all 0.3s ease",
                    borderRadius: "3px"
                  }} />
                </div>
              </div>
            )}

            <label>Confirmar contraseña</label>
            <div style={passwordContainerStyle}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                required
                placeholder="********"
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

// Componente para mostrar los requisitos de la contraseña
function PasswordRequirements({ password }) {
  const requirements = [
    { text: "Mínimo 8 caracteres", test: password.length >= 8 },
    { text: "Una mayúscula", test: /[A-Z]/.test(password) },
    { text: "Una minúscula", test: /[a-z]/.test(password) },
    { text: "Un número", test: /[0-9]/.test(password) },
    { text: "Un símbolo", test: /[!@#$%^&*(),.?":{}|<>\-_\[\]\/\\+=~;']/.test(password) }
  ];

  return (
    <div style={{ fontSize: "12px", lineHeight: "1.3" }}>
      {requirements.map((req, index) => (
        <div key={index} style={{ 
          color: req.test ? "limegreen" : "#999",
          display: "flex",
          alignItems: "center",
          marginBottom: "2px"
        }}>
          <span style={{ marginRight: "5px" }}>
            {req.test ? "✓" : "○"}
          </span>
          {req.text}
        </div>
      ))}
    </div>
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

const tooltipStyle = {
  position: "absolute",
  top: "100%",
  right: "0",
  backgroundColor: "#fff",
  border: "1px solid #ddd",
  borderRadius: "6px",
  padding: "12px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  zIndex: 10,
  marginTop: "4px",
  minWidth: "200px"
};

const infoIconStyle = {
  position: "relative",
  width: "16px",
  height: "16px",
  borderRadius: "50%",
  backgroundColor: "#ff4d4f",
  color: "white",
  fontSize: "12px",
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "help"
};

// Función para obtener el color de la barra de progreso
function getProgressColor(score) {
  if (score <= 2) return "#ff4d4f"; // Rojo
  if (score <= 3) return "#faad14"; // Amarillo
  if (score <= 4) return "#52c41a"; // Verde claro
  return "#389e0d"; // Verde oscuro
}

// Función mejorada para evaluar la fortaleza de la contraseña
function getPasswordStrength(password) {
  const validation = validatePassword(password);
  
  if (password.length === 0) return "";
  if (validation.score <= 2) return "débil";
  if (validation.score <= 4) return "media";
  return "fuerte";
}

// Función para validar todos los requisitos de la contraseña
function validatePassword(password) {
  const requirements = [
    { name: "mínimo 8 caracteres", test: password.length >= 8 },
    { name: "una mayúscula", test: /[A-Z]/.test(password) },
    { name: "una minúscula", test: /[a-z]/.test(password) },
    { name: "un número", test: /[0-9]/.test(password) },
    { name: "un símbolo", test: /[!@#$%^&*(),.?":{}|<>\-_\[\]\/\\+=~;']/.test(password) }
  ];

  const passedRequirements = requirements.filter(req => req.test);
  const missingRequirements = requirements.filter(req => !req.test).map(req => req.name);

  return {
    isValid: requirements.every(req => req.test),
    score: passedRequirements.length,
    missingRequirements
  };
}

function getColorStrength(strength) {
  switch (strength) {
    case "débil": return "crimson";
    case "media": return "#e69b00";
    case "fuerte": return "limegreen";
    default: return "#333";
  }
}