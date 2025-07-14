//middlewares/verificarMuteo.middleware.js
"use strict";

import { AppDataSource } from "../config/configDb.js";
import UsuarioMuteadoSchema from "../entity/usuarioMuteado.entity.js";
import { handleErrorClient } from "../handlers/responseHandlers.js";

const usuarioMuteadoRepo = AppDataSource.getRepository(UsuarioMuteadoSchema);

export const verificarMuteo = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const muteo = await usuarioMuteadoRepo.findOne({
      where: {
        usuario: { id: userId },
        activo: true,
      },
    });

    if (muteo && new Date(muteo.fecha_fin) > new Date()) {
      return handleErrorClient(
        res,
        403,
        `No puedes realizar esta acción porque estás muteado hasta el ${muteo.fecha_fin.toLocaleDateString()}`
      );
    }

    next();
  } catch (err) {
    console.error("Error al verificar muteo:", err);
    return res.status(500).json({ message: "Error al verificar estado de muteo" });
  }
};
