import { useEffect, useState } from "react";
import axios from "../services/root.services";
import { useParams } from "react-router-dom";

function Verificado() {
  const { token } = useParams();
  const [estado, setEstado] = useState("cargando");

  useEffect(() => {
    if (!token) {
      console.log("No hay token");
      setEstado("invalido");
      return;
    }
    
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

  return (
    <div style={{
      textAlign: "center",
      marginTop: "100px",
      color: "white",
      backgroundColor: "#111",
      padding: "40px",
      fontFamily: "Arial, sans-serif"
    }}>
     
      {estado === "cargando" && (
        <div>
          <div style={{ 
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #3498db",
            borderRadius: "50%",
            width: "50px",
            height: "50px",
            animation: "spin 2s linear infinite",
            margin: "0 auto 20px"
          }} />
          <p>Verificando enlace...</p>
        </div>
      )}
      
      {estado === "verificado" && (
        <>
          <h2 style={{ color: "limegreen", marginBottom: "15px" }}>
            ✅ Cuenta verificada exitosamente
          </h2>
          <p>Tu cuenta ha sido verificada correctamente.</p>
          <p>Ahora puedes iniciar sesión en CEE Connect.</p>
          <button 
            style={{
              backgroundColor: "limegreen",
              color: "white",
              border: "none",
              padding: "10px 20px",
              marginTop: "15px",
              borderRadius: "5px",
              cursor: "pointer"
            }}
            onClick={() => window.location.href = "/login"}
          >
            Ir a Login
          </button>
        </>
      )}

      {estado === "ya_verificado" && (
        <>
          <h2 style={{ color: "orange", marginBottom: "15px" }}>
            ⚠️ Cuenta ya verificada
          </h2>
          <p>Tu cuenta ya había sido verificada anteriormente.</p>
          <p>Puedes proceder a iniciar sesión en CEE Connect.</p>
          <button 
            style={{
              backgroundColor: "orange",
              color: "white",
              border: "none",
              padding: "10px 20px",
              marginTop: "15px",
              borderRadius: "5px",
              cursor: "pointer"
            }}
            onClick={() => window.location.href = "/login"}
          >
            Ir a Login
          </button>
        </>
      )}
      
      {estado === "invalido" && (
        <>
          <h2 style={{ color: "crimson", marginBottom: "15px" }}>
            ❌ Enlace inválido o expirado
          </h2>
          <p>Por favor vuelve a registrarte o solicita un nuevo enlace.</p>
          <button 
            style={{
              backgroundColor: "crimson",
              color: "white",
              border: "none",
              padding: "10px 20px",
              marginTop: "15px",
              borderRadius: "5px",
              cursor: "pointer"
            }}
            onClick={() => window.location.href = "/registro"}
          >
            Volver a Registro
          </button>
        </>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Verificado;