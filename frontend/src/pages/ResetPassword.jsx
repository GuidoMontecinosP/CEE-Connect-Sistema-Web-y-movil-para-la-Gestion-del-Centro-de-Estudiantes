import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authService } from "../services/auth.services.js";
import { EyeOutlined, EyeInvisibleOutlined, LockOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

export default function ResetPassword() {
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [showPasswordTooltip, setShowPasswordTooltip] = useState(false);
  
  const { token } = useParams();
  const navigate = useNavigate();

  // Verificar token al cargar el componente
  useEffect(() => {
    const verificarToken = async () => {
      if (!token) {
        setError("Token de recuperación no válido");
        setValidatingToken(false);
        return;
      }

      try {
        const response = await authService.verificarTokenRecuperacion(token);
        setTokenValid(true);
        setUserEmail(response.correo || ""); 
      } catch (error) {
        setError("El enlace de recuperación es inválido o ha expirado");
        setTokenValid(false);
      } finally {
        setValidatingToken(false);
      }
    };

    verificarToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar fortaleza de la contraseña (igual que en registro)
    const passwordValidation = validatePassword(nuevaContrasena);
    if (!passwordValidation.isValid) {
      setError(`La contraseña debe cumplir: ${passwordValidation.missingRequirements.join(", ")}`);
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      await authService.restablecerContrasena(token, nuevaContrasena);
      setSuccess(true);
    } catch (error) {
      console.log("Error al restablecer contraseña:", error.message);
      setError(error.message || "Error al restablecer la contraseña");
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de carga mientras se valida el token
  if (validatingToken) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: "center" }}>
            <div style={{ 
              width: "40px", 
              height: "40px", 
              border: "3px solid #f3f3f3",
              borderTop: "3px solid #1e3a8a",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem"
            }}></div>
            <p style={{ color: "#666" }}>Verificando enlace de recuperación...</p>
          </div>
        </div>
      </div>
    );
  }

  // Si el token no es válido
  if (!tokenValid) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: "center" }}>
            <ExclamationCircleOutlined style={{ fontSize: "48px", color: "#ef4444", marginBottom: "1rem" }} />
            <h1 style={{ color: "#ef4444", marginBottom: "1rem", fontWeight: 700 }}>
              Enlace no válido
            </h1>
            <p style={{ color: "#666", fontSize: "16px", lineHeight: "1.5", marginBottom: "2rem" }}>
              {error || "El enlace de recuperación es inválido o ha expirado."}
            </p>
            <button
              onClick={() => navigate("/recuperar-contrasena")}
              style={buttonStyleBlue}
            >
              Solicitar nuevo enlace
            </button>
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button
                onClick={() => navigate("/login")}
                style={linkButtonStyle}
              >
                Volver al inicio de sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de éxito
  if (success) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: "center" }}>
            <CheckCircleOutlined style={{ fontSize: "48px", color: "#22c55e", marginBottom: "1rem" }} />
            <h1 style={{ color: "#1e3a8a", marginBottom: "1rem", fontWeight: 700 }}>
              ¡Contraseña actualizada!
            </h1>
            <p style={{ color: "#666", fontSize: "16px", lineHeight: "1.5", marginBottom: "2rem" }}>
              Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <button
              onClick={() => navigate("/login")}
              style={buttonStyleBlue}
            >
              Ir a iniciar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Formulario principal
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <LockOutlined style={{ fontSize: "48px", color: "#1e3a8a", marginBottom: "1rem" }} />
          <h1 style={{ color: "#1e3a8a", marginBottom: "1rem", fontWeight: 700 }}>
            Restablecer contraseña
          </h1>
          {userEmail && (
            <p style={{ color: "#666", fontSize: "14px" }}>
              Para: <strong>{userEmail}</strong>
            </p>
          )}
          <p style={{ color: "#666", fontSize: "16px" }}>
            Ingresa tu nueva contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>
            Nueva contraseña
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={nuevaContrasena}
              onChange={(e) => {
                setNuevaContrasena(e.target.value);
                setPasswordStrength(getPasswordStrength(e.target.value));
              }}
              placeholder="********"
              required
              disabled={loading}
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={eyeButtonStyle}
            >
              {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            </button>
          </div>

          {/* Barra de progreso con ícono de info (igual que en registro) */}
          {nuevaContrasena && (
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
                    {validatePassword(nuevaContrasena).score}/5
                  </div>
                  {!validatePassword(nuevaContrasena).isValid && (
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
                          {validatePassword(nuevaContrasena).missingRequirements.map((req, index) => (
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
                  width: `${(validatePassword(nuevaContrasena).score / 5) * 100}%`,
                  height: "100%",
                  backgroundColor: getProgressColor(validatePassword(nuevaContrasena).score),
                  transition: "all 0.3s ease",
                  borderRadius: "3px"
                }} />
              </div>
            </div>
          )}

          <label style={labelStyle}>
            Confirmar contraseña
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmarContrasena}
              onChange={(e) => setConfirmarContrasena(e.target.value)}
              placeholder="Confirma tu nueva contraseña"
              required
              disabled={loading}
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={eyeButtonStyle}
            >
              {showConfirmPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            </button>
          </div>

          {/* Validación de coincidencia de contraseñas */}
          {confirmarContrasena && (
            <div style={{ marginBottom: "1rem", marginTop: "-0.8rem" }}>
              <div style={{
                fontSize: "12px",
                color: nuevaContrasena === confirmarContrasena ? "#22c55e" : "#ef4444"
              }}>
                {nuevaContrasena === confirmarContrasena ? "✓ Las contraseñas coinciden" : "✗ Las contraseñas no coinciden"}
              </div>
            </div>
          )}

          {error && (
            <div style={errorStyle}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || !nuevaContrasena || !confirmarContrasena}
            style={{
              ...buttonStyleBlue,
              opacity: (loading || !nuevaContrasena || !confirmarContrasena) ? 0.6 : 1,
              cursor: (loading || !nuevaContrasena || !confirmarContrasena) ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Actualizando..." : "Actualizar contraseña"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button
            onClick={() => navigate("/login")}
            style={linkButtonStyle}
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// === Funciones de validación (iguales al registro) ===

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

function getPasswordStrength(password) {
  const validation = validatePassword(password);
  
  if (password.length === 0) return "";
  if (validation.score <= 2) return "débil";
  if (validation.score <= 4) return "media";
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

function getProgressColor(score) {
  if (score <= 2) return "#ff4d4f"; // Rojo
  if (score <= 3) return "#faad14"; // Amarillo
  if (score <= 4) return "#52c41a"; // Verde claro
  return "#389e0d"; // Verde oscuro
}

// === Estilos originales ===

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
  maxWidth: "400px"
};

const labelStyle = {
  marginBottom: "8px",
  display: "block",
  color: "#333",
  fontWeight: "500"
};

const inputStyle = {
  width: "100%",
  padding: "12px 40px 12px 12px",
  marginBottom: "1.5rem",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "16px",
  lineHeight: "1.5",
  transition: "border-color 0.3s",
  boxSizing: "border-box"
};

const eyeButtonStyle = {
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