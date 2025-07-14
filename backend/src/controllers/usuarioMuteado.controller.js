//controllers/usuarioMuteado.controller.js
"use strict";

import { AppDataSource } from "../config/configDb.js";
import UsuarioMuteadoSchema from "../entity/usuarioMuteado.entity.js";
import UsuarioSchema from "../entity/usuario.entity.js";
import { handleErrorClient, handleSuccess, handleErrorServer } from "../handlers/responseHandlers.js";

const muteadoRepo = AppDataSource.getRepository(UsuarioMuteadoSchema);
const usuarioRepo = AppDataSource.getRepository(UsuarioSchema);

export const mutearUsuario = async (req, res) => {
  try {
    const { userId } = req.params;
    const { razon, fecha_fin } = req.body;

    const usuario = await usuarioRepo.findOne({ where: { id: parseInt(userId) } });
    if (!usuario) return handleErrorClient(res, 404, "Usuario no encontrado");

    const muteo = muteadoRepo.create({
      usuario,
      razon,
      fecha_fin: new Date(fecha_fin),
      activo: true,
    });

    await muteadoRepo.save(muteo);
    handleSuccess(res, 200, "Usuario muteado exitosamente", muteo);
  } catch (err) {
    console.error("Error al mutear:", err);
    handleErrorServer(res);
  }
};

export const desmutearUsuario = async (req, res) => {
  try {
    const { userId } = req.params;

    const muteo = await muteadoRepo.findOne({
      where: { usuario: { id: parseInt(userId) }, activo: true }
    });

    if (!muteo) return handleErrorClient(res, 404, "El usuario no está muteado");

    muteo.activo = false;
    await muteadoRepo.save(muteo);
    handleSuccess(res, 200, "Usuario desmuteado exitosamente", muteo);
  } catch (err) {
    console.error("Error al desmutear:", err);
    handleErrorServer(res);
  }
};
