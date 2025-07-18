// backend/src/services/sugerencias.service.js
"use strict";
import { ILike, Or, And } from 'typeorm';

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
  
  let whereConditions = {};
  
  // Filtros de categoría y estado
  if (filtros.categoria) {
    whereConditions.categoria = filtros.categoria;
  }
  
  if (filtros.estado) {
    whereConditions.estado = filtros.estado;
  }
  
  // Búsqueda por texto en múltiples campos
  if (filtros.busqueda) {
    const busqueda = filtros.busqueda.trim();
    if (busqueda) {
      // Crear condiciones de búsqueda que incluyan los filtros existentes
      const searchConditions = [
        { 
          ...whereConditions, 
          titulo: ILike(`%${busqueda}%`) 
        },
        { 
          ...whereConditions, 
          mensaje: ILike(`%${busqueda}%`) 
        },
        { 
          ...whereConditions, 
          categoria: ILike(`%${busqueda}%`) 
        }
      ];
      
      // Usar el array de condiciones para búsqueda OR
      const [sugerencias, total] = await this.sugerenciaRepository.findAndCount({
        where: searchConditions,
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
  }
  
  // Si no hay búsqueda, usar las condiciones normales
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

  // Campos permitidos para usuarios normales
  const camposPermitidos = ["titulo", "mensaje", "categoria", "contacto"];
  
  // Actualizar solo los campos proporcionados
  let huboCambios = false;
  const cambiosRealizados = {};

  camposPermitidos.forEach(campo => {
    if (datosSugerencia.hasOwnProperty(campo)) {
      const valorAnterior = sugerencia[campo];
      const valorNuevo = datosSugerencia[campo];
      
      // Verificar si realmente hay un cambio
      if (valorAnterior !== valorNuevo) {
        sugerencia[campo] = valorNuevo;
        cambiosRealizados[campo] = {
          anterior: valorAnterior,
          nuevo: valorNuevo
        };
        huboCambios = true;
      }
    }
  });

  if (!huboCambios) {
    throw new Error("No se detectaron cambios en los datos proporcionados");
    //cambiar
  }

  sugerencia.updatedAt = new Date();
  
  // Guardar y retornar con información de cambios
  const sugerenciaGuardada = await this.sugerenciaRepository.save(sugerencia);
  
  return {
    ...sugerenciaGuardada,
    cambiosRealizados // Opcional: para debugging o logging
  };
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

  async actualizarRespuestaAdmin(id, respuesta, estado, adminId) {
    const sugerencia = await this.sugerenciaRepository.findOne({
      where: { id },
      relations: ["autor", "adminResponsable"]
    });

    if (!sugerencia) {
      throw new Error("Sugerencia no encontrada");
    }

    if (!sugerencia.respuestaAdmin) {
      throw new Error("Esta sugerencia no tiene respuesta para actualizar");
    }

    const admin = await this.usuarioRepository.findOne({
      where: { id: adminId },
      relations: ["rol"]
    });

    // Actualizar la respuesta
    sugerencia.respuestaAdmin = respuesta;
    
    // Actualizar el estado si se proporciona
    if (estado) {
      sugerencia.estado = estado;
    }
    
    sugerencia.fechaRespuesta = new Date();
    sugerencia.adminResponsable = admin;
    sugerencia.updatedAt = new Date();

    return await this.sugerenciaRepository.save(sugerencia);
  }

  async eliminarRespuestaAdmin(id) {
    const sugerencia = await this.sugerenciaRepository.findOne({
      where: { id },
      relations: ["autor", "adminResponsable"]
    });

    if (!sugerencia) {
      throw new Error("Sugerencia no encontrada");
    }

    if (!sugerencia.respuestaAdmin) {
      throw new Error("Esta sugerencia no tiene respuesta para eliminar");
    }

    // Limpiar la respuesta y datos relacionados
    sugerencia.respuestaAdmin = null;
    sugerencia.fechaRespuesta = null;
    sugerencia.adminResponsable = null;
    sugerencia.estado = "pendiente"; // Regresar a estado pendiente
    sugerencia.updatedAt = new Date();

    return await this.sugerenciaRepository.save(sugerencia);
  }

  async cambiarEstadoSugerencia(id, estado, adminId) {
    const sugerencia = await this.sugerenciaRepository.findOne({
      where: { id },
      relations: ["autor", "adminResponsable"]
    });

    if (!sugerencia) {
      throw new Error("Sugerencia no encontrada");
    }

    // Validar que el estado sea válido
    const estadosValidos = ["pendiente", "en proceso", "resuelta", "archivada"];
    if (!estadosValidos.includes(estado)) {
      throw new Error("Estado no válido");
    }

    const admin = await this.usuarioRepository.findOne({
      where: { id: adminId },
      relations: ["rol"]
    });

    // Actualizar el estado
    sugerencia.estado = estado;
    sugerencia.adminResponsable = admin;
    sugerencia.updatedAt = new Date();

    return await this.sugerenciaRepository.save(sugerencia);
  }
}

export const sugerenciasService = new SugerenciasService();