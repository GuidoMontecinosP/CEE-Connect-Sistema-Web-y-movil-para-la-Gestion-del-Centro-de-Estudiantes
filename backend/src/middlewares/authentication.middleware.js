"use strict";
import passport from "passport";
import { handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";
import Usuario from "../entity/usuario.entity.js";
import { AppDataSource } from "../config/configDb.js";

export function authenticateJwt(req, res, next) {
  passport.authenticate("jwt", { session: false }, async (err, payload, info) => {
    try {
      if (err) {
        return handleErrorServer(res, 500, "Error de autenticación en el servidor");
      }

      if (!payload) {
        return handleErrorClient(
          res,
          401,
          "No tienes permiso para acceder a este recurso",
          { info: info?.message || "No se encontró el usuario autenticado" }
        );
      }

      // Buscar al usuario real con su rol asociado
      const usuarioRepository = AppDataSource.getRepository(Usuario);
      const usuario = await usuarioRepository.findOne({
        where: { id: payload.id },
        relations: ["rol"], //  Trae también el rol
      });

      if (!usuario || usuario.estado !== "activo") {
        return handleErrorClient(res, 403, "Cuenta desactivada o no válida");
      }

      req.user = usuario; //
      next();
    } catch (error) {
      console.error("Error en authenticateJwt:", error);
      return handleErrorServer(res, 500, "Error interno al validar el token");
    }
  })(req, res, next);
}
