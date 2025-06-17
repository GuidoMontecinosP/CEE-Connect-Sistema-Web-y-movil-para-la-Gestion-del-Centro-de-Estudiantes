"use strict";
import Usuario from "../entity/usuario.entity.js";
import Rol from "../entity/rol.entity.js";
import { AppDataSource } from "../config/configDb.js";
import {
  handleErrorClient,
  handleErrorServer,
} from "../handlers/responseHandlers.js";

export async function isAdmin(req, res, next) {
  try {
    const usuarioRepository = AppDataSource.getRepository(Usuario);
    const rolRepository = AppDataSource.getRepository(Rol);

    const usuario = await usuarioRepository.findOneBy({ id: req.user.id });
    if (!usuario) {
      return handleErrorClient(res, 404, "Usuario no encontrado en la base de datos");
    }

    const rol = await rolRepository.findOneBy({ id: usuario.rolId });
    if (!rol || !rol.isAdmin) {
      return handleErrorClient(
        res,
        403,
        "Acceso denegado",
        "Se requiere un rol de administrador para realizar esta acción."
      );
    }

    next(); // ✅ Todo OK, continúa
  } catch (error) {
    handleErrorServer(res, 500, "Error interno al verificar rol");
  }
}
