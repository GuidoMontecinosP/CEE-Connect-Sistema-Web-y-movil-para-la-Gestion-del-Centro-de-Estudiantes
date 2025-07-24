import { AppDataSource } from "../config/configDb.js";
import { Not, IsNull, Like } from "typeorm";

const votacionRepo = AppDataSource.getRepository("Votacion");
const opcionRepo = AppDataSource.getRepository("OpcionVotacion");
const respuestaRepo = AppDataSource.getRepository("RespuestaVotacion");

export const obtenerVotaciones = async (page = 1, limit = 10, filtros = {}) => {
  // Validar parámetros
  const pageNumber = Math.max(1, parseInt(page));
  const limitNumber = Math.min(Math.max(1, parseInt(limit)), 50); // Máximo 50 por página
  const skip = (pageNumber - 1) * limitNumber;

  // Construir condiciones de búsqueda
  const whereConditions = {};
  
  // Filtro por estado
  if (filtros.estado) {
    whereConditions.estado = filtros.estado;
  }
  
  // Filtro por búsqueda en el título
  if (filtros.busqueda) {
    whereConditions.titulo = Like(`%${filtros.busqueda}%`);
  }

  // Filtro por resultados publicados (solo para votaciones cerradas)
  if (filtros.resultadosPublicados !== undefined) {
    whereConditions.resultadosPublicados = filtros.resultadosPublicados;
  }

  // Obtener total de registros con filtros aplicados
  const total = await votacionRepo.count({ where: whereConditions });
  
  const votaciones = await votacionRepo.find({
    where: whereConditions,
    relations: {
      opciones: true,
    },
    order: {
      fechaCreacion: "DESC",
    },
    skip: skip,
    take: limitNumber,
  });

  // Ordenar: activas primero, luego cerradas por fecha de cierre DESC, luego publicadas por fecha de publicación DESC
  const votacionesOrdenadas = votaciones.sort((a, b) => {
    // Prioridad: activas primero
    if (a.estado === "activa" && b.estado !== "activa") return -1;
    if (a.estado !== "activa" && b.estado === "activa") return 1;
    
    // Si ambas están cerradas, separar por si están publicadas o no
    if (a.estado === "cerrada" && b.estado === "cerrada") {
      // Las no publicadas van antes que las publicadas
      if (!a.resultadosPublicados && b.resultadosPublicados) return -1;
      if (a.resultadosPublicados && !b.resultadosPublicados) return 1;
      
      // Si ambas tienen el mismo estado de publicación
      if (!a.resultadosPublicados && !b.resultadosPublicados) {
        // Ordenar cerradas no publicadas por fecha de cierre (más recientes primero)
        return new Date(b.fechaCierre) - new Date(a.fechaCierre);
      } else {
        // Ordenar publicadas por fecha de publicación (más recientes primero)
        return new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion);
      }
    }
    
    // Fallback: ordenar por fecha de creación
    return new Date(b.fechaCreacion) - new Date(a.fechaCreacion);
  });

  // Calcular información de paginación
  const totalPages = Math.ceil(total / limitNumber);
  const hasNextPage = pageNumber < totalPages;
  const hasPrevPage = pageNumber > 1;

  return {
    data: votacionesOrdenadas,
    filtros: filtros, // Devolver los filtros aplicados
    pagination: {
      currentPage: pageNumber,
      totalPages,
      totalItems: total,
      itemsPerPage: limitNumber,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? pageNumber + 1 : null,
      prevPage: hasPrevPage ? pageNumber - 1 : null
    }
  };
};

export const crearVotacion = async (data) => {
  const { titulo, opciones } = data;

  // Validar que haya al menos 2 opciones
  if (!opciones || opciones.length < 2) {
    throw new Error("Debe haber al menos 2 opciones para votar");
  }

  if (opciones.length > 10) {
    throw new Error("Máximo 10 opciones permitidas");
  }

  // Crear la votación
  const nuevaVotacion = votacionRepo.create({
    titulo,
  });

  const votacionGuardada = await votacionRepo.save(nuevaVotacion);

  // Crear todas las opciones dinámicamente
  const opcionesCreadas = opciones.map(textoOpcion => 
    opcionRepo.create({ textoOpcion, votacion: votacionGuardada })
  );

  await opcionRepo.save(opcionesCreadas);

  return await votacionRepo.findOne({
    where: { id: votacionGuardada.id },
    relations: { opciones: true }
  });
};

export const obtenerVotacionPorId = async (id) => {
  return await votacionRepo.findOne({
    where: { id: parseInt(id) },
    relations: {
      opciones: true,
    },
  });
};

export const cerrarVotacion = async (votacionId) => {
  const votacion = await votacionRepo.findOneBy({ id: parseInt(votacionId) });
  
  if (!votacion) {
    throw new Error("Votación no encontrada");
  }

  if (votacion.estado === "cerrada") {
    throw new Error("La votación ya está cerrada");
  }

  const now = new Date();

  // Actualizar estado y publicar resultados
  await votacionRepo.update(
    { id: votacionId },
    { 
      estado: "cerrada",
      fechaCierre: now,
    }
  );

  // Borrar todos los tokens
  await AppDataSource.getRepository("TokenVotacion").delete({
    votacion: { id: votacionId }
  });

  return { mensaje: "Votación cerrada y resultados publicados correctamente" };
};

export const obtenerResultados = async (votacionId) => {
  const votacion = await votacionRepo.findOne({
    where: { id: parseInt(votacionId) },
    relations: { opciones: true }
  });
  
  if (!votacion) {
    throw new Error("Votación no encontrada");
  }

  const resultados = [];
  
  for (const opcion of votacion.opciones) {
    const votos = await respuestaRepo.count({
      where: { opcion: { id: opcion.id } }
    });
    
    resultados.push({
      opcion: opcion.textoOpcion,
      votos: votos
    });
  }

  // Ordenar por cantidad de votos (mayor a menor)
  resultados.sort((a, b) => b.votos - a.votos);

  return {
    votacion: {
      id: votacion.id,
      titulo: votacion.titulo,
      estado: votacion.estado,
      resultadosPublicados: votacion.resultadosPublicados
    },
    resultados
  };
};

export const obtenerParticipantes = async (votacionId, page = 1, limit = 20, filtros = {}) => {
  // Validar parámetros
  const pageNumber = Math.max(1, parseInt(page));
  const limitNumber = Math.min(Math.max(1, parseInt(limit)), 100); // Máximo 100 participantes por página
  const skip = (pageNumber - 1) * limitNumber;

  // 1) Validar existencia de la votación
  const votacion = await votacionRepo.findOneBy({ id: votacionId });
  if (!votacion) throw new Error("Votación no encontrada");

  // Construir condiciones de búsqueda
  const whereConditions = { 
    opcion: { votacion: { id: votacionId } } 
  };

  // Filtro por búsqueda en nombre o correo del usuario
  if (filtros.busqueda) {
    whereConditions.usuario = [
      { nombre: Like(`%${filtros.busqueda}%`) },
      { correo: Like(`%${filtros.busqueda}%`) }
    ];
  }

  // 2) Contar total de participantes con filtros
  const totalParticipantes = await respuestaRepo.count({
    where: whereConditions,
    relations: { usuario: true }
  });

  // 3) Obtener respuestas paginadas con su usuario
  const respuestas = await respuestaRepo.find({
    where: whereConditions,
    relations: { usuario: true, opcion: true },
    order: { fechaVoto: "DESC" },
    skip: skip,
    take: limitNumber
  });

  // 4) Formatear el array para el frontend
  const participantes = respuestas.map(r => ({
    usuario: {
      id: r.usuario?.id,
      nombre: r.usuario?.nombre || "Sin nombre",
      correo: r.usuario?.correo || "Sin correo"
    },
    opcionVotada: r.opcion?.textoOpcion,
    fechaVoto: r.fechaVoto
  }));

  // 5) Calcular información de paginación
  const totalPages = Math.ceil(totalParticipantes / limitNumber);
  const hasNextPage = pageNumber < totalPages;
  const hasPrevPage = pageNumber > 1;

  // 6) Devolver el paquete completo
  return {
    votacion: {
      id: votacion.id,
      titulo: votacion.titulo,
      estado: votacion.estado
    },
    totalVotos: totalParticipantes,
    participantes,
    filtros: filtros, // Devolver los filtros aplicados
    pagination: {
      currentPage: pageNumber,
      totalPages,
      totalItems: totalParticipantes,
      itemsPerPage: limitNumber,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? pageNumber + 1 : null,
      prevPage: hasPrevPage ? pageNumber - 1 : null
    }
  };
};

export const publicarResultados = async (votacionId) => {
  const votacion = await votacionRepo.findOneBy({ id: parseInt(votacionId) });
  
  if (!votacion) {
    throw new Error("Votación no encontrada");
  }

  if (votacion.estado !== "cerrada") {
    throw new Error("Solo se pueden publicar resultados de votaciones cerradas");
  }

  if (votacion.resultadosPublicados) {
    throw new Error("Los resultados ya han sido publicados");
  }

  const now = new Date();

  // Publicar resultados
  await votacionRepo.update(
    { id: votacionId },
    { 
      resultadosPublicados: true,
      fechaPublicacion: now
    }
  );

  return { mensaje: "Resultados publicados correctamente" };
};

// Función auxiliar para obtener votaciones por estado con paginación
export const obtenerVotacionesPorEstado = async (estado, page = 1, limit = 10, filtros = {}) => {
  const pageNumber = Math.max(1, parseInt(page));
  const limitNumber = Math.min(Math.max(1, parseInt(limit)), 50);
  const skip = (pageNumber - 1) * limitNumber;

  // Construir condiciones de búsqueda
  const whereConditions = { estado };
  
  // Filtro por búsqueda en el título
  if (filtros.busqueda) {
    whereConditions.titulo = Like(`%${filtros.busqueda}%`);
  }

  // Filtro por resultados publicados (solo para votaciones cerradas)
  if (filtros.resultadosPublicados !== undefined && estado === "cerrada") {
    whereConditions.resultadosPublicados = filtros.resultadosPublicados;
  }

  const [votaciones, total] = await votacionRepo.findAndCount({
    where: whereConditions,
    relations: { opciones: true },
    order: { fechaCreacion: "DESC" },
    skip: skip,
    take: limitNumber
  });

  const totalPages = Math.ceil(total / limitNumber);
  const hasNextPage = pageNumber < totalPages;
  const hasPrevPage = pageNumber > 1;

  return {
    data: votaciones,
    filtros: { estado, ...filtros }, // Devolver los filtros aplicados
    pagination: {
      currentPage: pageNumber,
      totalPages,
      totalItems: total,
      itemsPerPage: limitNumber,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? pageNumber + 1 : null,
      prevPage: hasPrevPage ? pageNumber - 1 : null
    }
  };
};

// Nueva función para búsqueda avanzada de votaciones
export const buscarVotaciones = async (termino, page = 1, limit = 10, filtros = {}) => {
  const pageNumber = Math.max(1, parseInt(page));
  const limitNumber = Math.min(Math.max(1, parseInt(limit)), 50);
  const skip = (pageNumber - 1) * limitNumber;

  // Construir condiciones de búsqueda
  const whereConditions = {
    titulo: Like(`%${termino}%`)
  };

  // Aplicar filtros adicionales
  if (filtros.estado) {
    whereConditions.estado = filtros.estado;
  }

  if (filtros.resultadosPublicados !== undefined) {
    whereConditions.resultadosPublicados = filtros.resultadosPublicados;
  }

  const [votaciones, total] = await votacionRepo.findAndCount({
    where: whereConditions,
    relations: { opciones: true },
    order: { fechaCreacion: "DESC" },
    skip: skip,
    take: limitNumber
  });

  const totalPages = Math.ceil(total / limitNumber);
  const hasNextPage = pageNumber < totalPages;
  const hasPrevPage = pageNumber > 1;

  return {
    data: votaciones,
    termino: termino,
    filtros: filtros,
    pagination: {
      currentPage: pageNumber,
      totalPages,
      totalItems: total,
      itemsPerPage: limitNumber,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? pageNumber + 1 : null,
      prevPage: hasPrevPage ? pageNumber - 1 : null
    }
  };
};