
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

    if (!razon || !fecha_fin) {
      return handleErrorClient(res, 400, "Razón y fecha de fin son requeridas");
    }
    //validar que no este muteado
    const muteoExistente = await muteadoRepo.findOne({
      where: { usuario: { id: parseInt(userId) }, activo: true }
    });
    if (muteoExistente) {
      return handleErrorClient(res, 400, "El usuario ya está muteado");
    }
    if (new Date(fecha_fin) <= new Date()) {
      return handleErrorClient(res, 400, "La fecha de fin debe ser futura");
    }
    const muteo = muteadoRepo.create({
      usuario,
      razon,
      fecha_fin: new Date(fecha_fin),
      activo: true,
    });
//console.log("Muteando usuario:", muteo);
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
        
  //  console.log("Desmuteando usuario:", muteo);
        
    // Cambiar el estado del objeto y guardarlo
    muteo.activo = false;
    await muteadoRepo.save(muteo);
    //    console.log("Usuario desmuteado:", muteo);
    handleSuccess(res, 200, "Usuario desmuteado exitosamente", muteo);
  } catch (err) {
    console.error("Error al desmutear:", err);
    handleErrorServer(res);
  }
};



export const obtenerEstadoMuteo = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const muteo = await muteadoRepo.findOne({
      where: {
        usuario: { id: parseInt(userId) },
        activo: true,
      },
    });

    if (!muteo) {
      return handleSuccess(res, 200, "Usuario no muteado", {
        isMuted: false,
        muteo: null
      });
    }

    const ahora = new Date();
    const fechaFinMuteo = new Date(muteo.fecha_fin);

    // Verificar si el muteo sigue vigente
    if (ahora < fechaFinMuteo) {
      return handleSuccess(res, 200, "Usuario muteado", {
        isMuted: true,
        muteo: muteo
      });
    }

    // Si el muteo expiró, desactivarlo automáticamente
    muteo.activo = false;
    await muteadoRepo.save(muteo);

    return handleSuccess(res, 200, "Muteo expirado", {
      isMuted: false,
      muteo: null
    });

  } catch (err) {
    console.error("Error al obtener estado de muteo:", err);
    handleErrorServer(res);
  }
};
