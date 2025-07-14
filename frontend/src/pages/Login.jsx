import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/root.services.js";
import { useAuth } from "../context/AuthContext";
import ubbFondo from "../assets/portal.png";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post("/auth/login", {
      correo,
      password,
    });

    const { token, user } = res.data.data;
    login(user, token); // ✅ Usuario con .rol.nombre disponible
    navigate("/noticias");
  } catch (error) {
    alert("Credenciales inválidas");
  }
};


  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Segoe UI, sans-serif" }}>
      {/* Fondo izquierdo con imagen difuminada */}
      <div
        style={{
        flex: 2,
        backgroundImage: `url(${ubbFondo})`,
        backgroundSize: "cover",             // ✅ sin recorte horizontal
        backgroundPosition: "center",     // ✅ anclado a la izquierda
        position: "relative",
        filter: "brightness(1.5)",             // leve oscurecimiento
        }}
      >
        {/* Overlay oscuro (opcional) */}
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
          position: "relative",
          zIndex: 2,
        }}
      >
        <img
          src="/src/assets/escudo-color-gradiente-oscuro.png"
          alt="Logo UBB"
          style={{
            width: "220px",
            marginBottom: "2rem",
          }}
        />

        <h1 style={{ color: "#1e3a8a", marginBottom: "2rem", fontWeight: 700 }}>
          Iniciar sesión
        </h1>

        <form onSubmit={handleLogin} style={{ width: "100%", maxWidth: "360px" }}>
          <label style={{ color: "#333", marginBottom: "8px", display: "block" }}>
            Correo institucional
          </label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="usuario@alumnos.ubiobio.cl"
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "1rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />

          <label style={{ color: "#333", marginBottom: "8px", display: "block" }}>
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "1.5rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#1e3a8a",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Iniciar sesión
          </button>
        </form>

        <h2
          style={{
            fontSize: "26px",
            textAlign: "center",
            marginTop: "4rem",
            color: "#1e3a8a",
          }}
        >
          ¡Bienvenido a <br /> CEE Connect!
        </h2>
      </div>
    </div>
  );
}
