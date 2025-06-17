"use strict";
import passport from "passport";
import { handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";
import Usuario from "../entity/usuario.entity.js";
import { AppDataSource } from "../config/configDb.js";

export function authenticateJwt(req, res, next) {
  passport.authenticate("jwt", { session: false }, async (err, user, info) => {
    try {
      if (err) {
        return handleErrorServer(res, 500, "Error de autenticación en el servidor");
      }

      if (!user) {
        return handleErrorClient(
          res,
          401,
          "No tienes permiso para acceder a este recurso",
          { info: info?.message || "No se encontró el usuario autenticado" }
        );
      }

      // Validar que el usuario exista en la base de datos y esté activo
      const usuarioRepository = AppDataSource.getRepository(Usuario);
      const usuario = await usuarioRepository.findOneBy({ id: user.id });

      if (!usuario || usuario.estado !== "activo") {
        return handleErrorClient(res, 403, "Cuenta desactivada o no válida");
      }

      req.user = user; // Payload JWT validado previamente
      next();
    } catch (error) {
      return handleErrorServer(res, 500, "Error interno al validar el token");
    }
  })(req, res, next);
}
