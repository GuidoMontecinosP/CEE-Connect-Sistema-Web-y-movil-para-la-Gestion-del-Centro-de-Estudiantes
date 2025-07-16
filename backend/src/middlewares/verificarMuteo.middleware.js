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

    if (muteo) {
      const ahora = new Date();
      const fechaFinMuteo = new Date(muteo.fecha_fin);

      // logs para debug
      //console.log("Verificando muteo:");
      //console.log("- Fecha actual:", ahora.toISOString());
      //console.log("- Fecha fin muteo:", fechaFinMuteo.toISOString());
      //console.log("- Muteo vigente:", ahora < fechaFinMuteo);

      // ✅ Verificar si el muteo sigue vigente
      if (ahora < fechaFinMuteo) {
        return handleErrorClient(
          res,
          403,
          `No puedes realizar esta acción porque estás muteado hasta el ${fechaFinMuteo.toLocaleDateString('es-CL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'America/Santiago'
          })}`
        );
      }

      //  Si llegamos aquí, el muteo ya expiró
      //console.log("Muteo expirado, desactivando automáticamente...");
      muteo.activo = false;
      await usuarioMuteadoRepo.save(muteo);
    }

    console.log("Usuario no muteado o muteo expirado, continuando...");
    next();
  } catch (err) {
    console.error("Error al verificar muteo:", err);
    return res.status(500).json({ message: "Error al verificar estado de muteo" });
  }
};