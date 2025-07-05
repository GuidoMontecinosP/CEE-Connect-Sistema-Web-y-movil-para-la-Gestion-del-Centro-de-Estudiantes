"use strict";
import {
  handleErrorClient,
  handleErrorServer,
} from "../handlers/responseHandlers.js";

export async function isAdmin(req, res, next) {
  try {
    const rol = req.user?.rol;
    //console.log("Rol del usuario:", rol);

    if (!rol || !rol.isAdmin) {
      return handleErrorClient(
        res,
        403,
        "Acceso denegado",
        "Se requiere un rol de administrador para realizar esta acción."
      );
    }

    next(); // ✅ Usuario es admin, continúa
  } catch (error) {
    console.error("Error en isAdmin:", error);
    handleErrorServer(res, 500, "Error interno al verificar rol");
  }
}
