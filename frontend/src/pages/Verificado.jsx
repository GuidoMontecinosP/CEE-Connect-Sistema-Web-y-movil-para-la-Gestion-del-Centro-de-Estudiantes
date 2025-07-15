import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "../services/root.services";

function Verificado() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [estado, setEstado] = useState("cargando");

  useEffect(() => {
    if (!token) {
      setEstado("invalido");
      return;
    }

    axios
      .get(`/auth/verificar/${token}`)
      .then(() => setEstado("verificado"))
      .catch(() => setEstado("invalido"));
  }, [token]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px", color: "white", backgroundColor: "#111", padding: "40px" }}>
      {estado === "cargando" && <p>Verificando enlace...</p>}
      {estado === "verificado" && (
        <>
          <h2 style={{ color: "limegreen" }}>✅ Cuenta verificada</h2>
          <p>Ahora puedes iniciar sesión en CEE Connect.</p>
        </>
      )}
      {estado === "invalido" && (
        <>
          <h2 style={{ color: "crimson" }}>❌ Enlace inválido o expirado</h2>
          <p>Por favor vuelve a registrarte o solicita un nuevo enlace.</p>
        </>
      )}
    </div>
  );
}

export default Verificado;
