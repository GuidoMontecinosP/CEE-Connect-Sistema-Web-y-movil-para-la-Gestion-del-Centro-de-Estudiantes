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

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    const passwordError = validatePassword(nuevaContrasena);
    if (passwordError) {
      setError(passwordError);
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
              onChange={(e) => setNuevaContrasena(e.target.value)}
              placeholder="Mínimo 8 caracteres"
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

          {/* Indicador de fortaleza de contraseña */}
          {nuevaContrasena && (
            <div style={{ marginBottom: "1rem" }}>
              <div style={{
                fontSize: "12px",
                color: nuevaContrasena.length >= 8 ? "#22c55e" : "#ef4444"
              }}>
                 Mínimo 8 caracteres {nuevaContrasena.length >= 8 ? "" : `(${nuevaContrasena.length}/8)`}
              </div>
              {confirmarContrasena && (
                <div style={{
                  fontSize: "12px",
                  color: nuevaContrasena === confirmarContrasena ? "#22c55e" : "#ef4444"
                }}>
                  {nuevaContrasena === confirmarContrasena ? "✓ Las contraseñas coinciden" : "✗ Las contraseñas no coinciden"}
                </div>
              )}
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