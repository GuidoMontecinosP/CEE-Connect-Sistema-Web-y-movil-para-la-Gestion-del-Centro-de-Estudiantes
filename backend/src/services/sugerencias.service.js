// backend/src/services/sugerencias.service.js
"use strict";

import { AppDataSource } from "../config/configDb.js";
import SugerenciaSchema from "../entity/sugerencia.entity.js";
import UsuarioSchema from "../entity/usuario.entity.js";

class SugerenciasService {
  constructor() {
    this.sugerenciaRepository = AppDataSource.getRepository(SugerenciaSchema);
    this.usuarioRepository = AppDataSource.getRepository(UsuarioSchema);
  }

  async crearSugerencia(datosaSugerencia) {
    const { titulo, mensaje, categoria, contacto, autorId } = datosaSugerencia;

    // Validar que el usuario existe
    const usuario = await this.usuarioRepository.findOne({
      where: { id: autorId }
    });

    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    const nuevaSugerencia = this.sugerenciaRepository.create({
      titulo,
      mensaje,
      categoria,
      contacto,
      autor: usuario,
      estado: "pendiente",
      isReportada: false,
      reportes: 0
    });

    return await this.sugerenciaRepository.save(nuevaSugerencia);
  }

  async obtenerSugerencias(page = 1, limit = 10, filtros = {}) {
    const skip = (page - 1) * limit;
    
    const whereConditions = {};
    
    if (filtros.categoria) {
      whereConditions.categoria = filtros.categoria;
    }
    
    if (filtros.estado) {
      whereConditions.estado = filtros.estado;
    }

    const [sugerencias, total] = await this.sugerenciaRepository.findAndCount({
      where: whereConditions,
      relations: ["autor", "adminResponsable"],
      order: { createdAt: "DESC" },
      skip,
      take: limit
    });

    return {
      data: sugerencias,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async obtenerSugerenciaPorId(id) {
    return await this.sugerenciaRepository.findOne({
      where: { id },
      relations: ["autor", "adminResponsable"]
    });
  }

  async actualizarSugerencia(id, datosSugerencia, userId, isAdmin) {
    const sugerencia = await this.sugerenciaRepository.findOne({
      where: { id },
      relations: ["autor"]
    });

    if (!sugerencia) {
      throw new Error("Sugerencia no encontrada");
    }

    // Solo el autor puede modificar su sugerencia (excepto admins)
    if (!isAdmin && sugerencia.autor.id !== userId) {
      throw new Error("No tienes permiso para modificar esta sugerencia");
    }

    // Actualizar solo los campos permitidos para usuarios normales
    const camposPermitidos = ["titulo", "mensaje", "categoria", "contacto"];
    
    camposPermitidos.forEach(campo => {
      if (datosSugerencia[campo] !== undefined) {
        sugerencia[campo] = datosSugerencia[campo];
      }
    });

    sugerencia.updatedAt = new Date();

    return await this.sugerenciaRepository.save(sugerencia);
  }

  async eliminarSugerencia(id, userId, isAdmin) {
    const sugerencia = await this.sugerenciaRepository.findOne({
      where: { id },
      relations: ["autor"]
    });

    if (!sugerencia) {
      throw new Error("Sugerencia no encontrada");
    }

    // Solo el autor o un admin pueden eliminar la sugerencia
    if (!isAdmin && sugerencia.autor.id !== userId) {
      throw new Error("No tienes permiso para eliminar esta sugerencia");
    }

    await this.sugerenciaRepository.remove(sugerencia);
  }

  async reportarSugerencia(id, userId) {
    const sugerencia = await this.sugerenciaRepository.findOne({
      where: { id },
      relations: ["autor"]
    });

    if (!sugerencia) {
      throw new Error("Sugerencia no encontrada");
    }

    // No permitir que el autor reporte su propia sugerencia
    if (sugerencia.autor.id === userId) {
      throw new Error("No puedes reportar tu propia sugerencia");
    }

    // Incrementar contador de reportes
    sugerencia.reportes += 1;
    sugerencia.isReportada = true;

    return await this.sugerenciaRepository.save(sugerencia);
  }

  async responderSugerencia(id, respuesta, estado, adminId) {
    const sugerencia = await this.sugerenciaRepository.findOne({
      where: { id },
      relations: ["autor"]
    });

    if (!sugerencia) {
      throw new Error("Sugerencia no encontrada");
    }

    const admin = await this.usuarioRepository.findOne({
      where: { id: adminId },
      relations: ["rol"]
    });

    sugerencia.respuestaAdmin = respuesta;
    sugerencia.estado = estado || "resuelta";
    sugerencia.fechaRespuesta = new Date();
    sugerencia.adminResponsable = admin;
    sugerencia.updatedAt = new Date();

    return await this.sugerenciaRepository.save(sugerencia);
  }

  async obtenerSugerenciasReportadas(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [sugerencias, total] = await this.sugerenciaRepository.findAndCount({
      where: { isReportada: true },
      relations: ["autor", "adminResponsable"],
      order: { reportes: "DESC", createdAt: "DESC" },
      skip,
      take: limit
    });

    return {
      data: sugerencias,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async obtenerSugerenciasPorUsuario(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [sugerencias, total] = await this.sugerenciaRepository.findAndCount({
      where: { autor: { id: userId } },
      relations: ["autor", "adminResponsable"],
      order: { createdAt: "DESC" },
      skip,
      take: limit
    });

    return {
      data: sugerencias,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async obtenerEstadisticas() {
    const total = await this.sugerenciaRepository.count();
    const pendientes = await this.sugerenciaRepository.count({
      where: { estado: "pendiente" }
    });
    const enProceso = await this.sugerenciaRepository.count({
      where: { estado: "en proceso" }
    });
    const resueltas = await this.sugerenciaRepository.count({
      where: { estado: "resuelta" }
    });
    const archivadas = await this.sugerenciaRepository.count({
      where: { estado: "archivada" }
    });
    const reportadas = await this.sugerenciaRepository.count({
      where: { isReportada: true }
    });

    return {
      total,
      pendientes,
      enProceso,
      resueltas,
      archivadas,
      reportadas
    };
  }
}

export const sugerenciasService = new SugerenciasService();