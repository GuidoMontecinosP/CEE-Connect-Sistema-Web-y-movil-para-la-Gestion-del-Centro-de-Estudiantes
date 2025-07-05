// backend/src/controllers/sugerencias.controller.js
"use strict";

import { 
  handleErrorClient, 
  handleErrorServer, 
  handleSuccess 
} from "../handlers/responseHandlers.js";
import { sugerenciasService } from "../services/sugerencias.service.js";

export async function crearSugerencia(req, res) {
  try {
    const { titulo, mensaje, categoria, contacto } = req.body;
    const autorId = req.user.id;

    const nuevaSugerencia = await sugerenciasService.crearSugerencia({
      titulo,
      mensaje,
      categoria,
      contacto,
      autorId
    });

    handleSuccess(res, 201, "Sugerencia creada exitosamente", nuevaSugerencia);
  } catch (error) {
    console.error("Error al crear sugerencia:", error);
    if (error.message.includes("validación")) {
      handleErrorClient(res, 400, error.message);
    } else {
      handleErrorServer(res, 500, "Error interno del servidor");
    }
  }
}

export async function obtenerSugerencias(req, res) {
  try {
    const { page = 1, limit = 10, categoria, estado } = req.query;
    
    const filtros = {};
    if (categoria) filtros.categoria = categoria;
    if (estado) filtros.estado = estado;

    const sugerencias = await sugerenciasService.obtenerSugerencias(
      parseInt(page),
      parseInt(limit),
      filtros
    );

    handleSuccess(res, 200, "Sugerencias obtenidas exitosamente", sugerencias);
  } catch (error) {
    console.error("Error al obtener sugerencias:", error);
    handleErrorServer(res, 500, "Error interno del servidor");
  }
}

export async function obtenerSugerenciaPorId(req, res) {
  try {
    const { id } = req.params;
    
    const sugerencia = await sugerenciasService.obtenerSugerenciaPorId(parseInt(id));
    
    if (!sugerencia) {
      return handleErrorClient(res, 404, "Sugerencia no encontrada");
    }

    handleSuccess(res, 200, "Sugerencia obtenida exitosamente", sugerencia);
  } catch (error) {
    console.error("Error al obtener sugerencia:", error);
    handleErrorServer(res, 500, "Error interno del servidor");
  }
}

export async function actualizarSugerencia(req, res) {
  try {
    const { id } = req.params;
    const { titulo, mensaje, categoria, contacto } = req.body;
    const userId = req.user.id;
    const isAdmin = req.user.rol?.isAdmin;

    const sugerenciaActualizada = await sugerenciasService.actualizarSugerencia(
      parseInt(id),
      { titulo, mensaje, categoria, contacto },
      userId,
      isAdmin
    );

    handleSuccess(res, 200, "Sugerencia actualizada exitosamente", sugerenciaActualizada);
  } catch (error) {
    console.error("Error al actualizar sugerencia:", error);
    if (error.message.includes("No tienes permiso") || error.message.includes("no encontrada")) {
      handleErrorClient(res, error.message.includes("No tienes permiso") ? 403 : 404, error.message);
    } else {
      handleErrorServer(res, 500, "Error interno del servidor");
    }
  }
}

export async function eliminarSugerencia(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.rol?.isAdmin;

    await sugerenciasService.eliminarSugerencia(parseInt(id), userId, isAdmin);
    
    handleSuccess(res, 200, "Sugerencia eliminada exitosamente");
  } catch (error) {
    console.error("Error al eliminar sugerencia:", error);
    if (error.message.includes("No tienes permiso") || error.message.includes("no encontrada")) {
      handleErrorClient(res, error.message.includes("No tienes permiso") ? 403 : 404, error.message);
    } else {
      handleErrorServer(res, 500, "Error interno del servidor");
    }
  }
}



export async function responderSugerencia(req, res) {
  try {
    const { id } = req.params;
    const { respuesta, estado } = req.body;
    const adminId = req.user.id;

    const sugerenciaRespondida = await sugerenciasService.responderSugerencia(
      parseInt(id),
      respuesta,
      estado,
      adminId
    );

    handleSuccess(res, 200, "Respuesta enviada exitosamente", sugerenciaRespondida);
  } catch (error) {
    console.error("Error al responder sugerencia:", error);
    if (error.message.includes("no encontrada")) {
      handleErrorClient(res, 404, error.message);
    } else {
      handleErrorServer(res, 500, "Error interno del servidor");
    }
  }
}

export async function obtenerSugerenciasReportadas(req, res) {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const sugerenciasReportadas = await sugerenciasService.obtenerSugerenciasReportadas(
      parseInt(page),
      parseInt(limit)
    );

    handleSuccess(res, 200, "Sugerencias reportadas obtenidas exitosamente", sugerenciasReportadas);
  } catch (error) {
    console.error("Error al obtener sugerencias reportadas:", error);
    handleErrorServer(res, 500, "Error interno del servidor");
  }
}

export async function obtenerMisSugerencias(req, res) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    
    const misSugerencias = await sugerenciasService.obtenerSugerenciasPorUsuario(
      userId,
      parseInt(page),
      parseInt(limit)
    );

    handleSuccess(res, 200, "Mis sugerencias obtenidas exitosamente", misSugerencias);
  } catch (error) {
    console.error("Error al obtener mis sugerencias:", error);
    handleErrorServer(res, 500, "Error interno del servidor");
  }
}

export async function actualizarRespuestaAdmin(req, res) {
  try {
    const { id } = req.params;
    const { respuesta, estado } = req.body;
    const adminId = req.user.id;

    const sugerenciaActualizada = await sugerenciasService.actualizarRespuestaAdmin(
      parseInt(id),
      respuesta,
      estado,
      adminId
    );

    handleSuccess(res, 200, "Respuesta actualizada exitosamente", sugerenciaActualizada);
  } catch (error) {
    console.error("Error al actualizar respuesta:", error);
    if (error.message.includes("no encontrada") || error.message.includes("no tiene respuesta")) {
      handleErrorClient(res, 404, error.message);
    } else {
      handleErrorServer(res, 500, "Error interno del servidor");
    }
  }
}

export async function eliminarRespuestaAdmin(req, res) {
  try {
    const { id } = req.params;

    const sugerenciaActualizada = await sugerenciasService.eliminarRespuestaAdmin(parseInt(id));

    handleSuccess(res, 200, "Respuesta eliminada exitosamente", sugerenciaActualizada);
  } catch (error) {
    console.error("Error al eliminar respuesta:", error);
    if (error.message.includes("no encontrada") || error.message.includes("no tiene respuesta")) {
      handleErrorClient(res, 404, error.message);
    } else {
      handleErrorServer(res, 500, "Error interno del servidor");
    }
  }
}

export async function cambiarEstadoSugerencia(req, res) {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const adminId = req.user.id;

    const sugerenciaActualizada = await sugerenciasService.cambiarEstadoSugerencia(
      parseInt(id),
      estado,
      adminId
    );

    handleSuccess(res, 200, "Estado actualizado exitosamente", sugerenciaActualizada);
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    if (error.message.includes("no encontrada")) {
      handleErrorClient(res, 404, error.message);
    } else if (error.message.includes("Estado no válido")) {
      handleErrorClient(res, 400, error.message);
    } else {
      handleErrorServer(res, 500, "Error interno del servidor");
    }
  }
}