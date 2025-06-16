import { AppDataSource } from "../config/configDb.js";

const votacionRepo = AppDataSource.getRepository("Votacion");
const opcionRepo = AppDataSource.getRepository("OpcionVotacion");
const respuestaRepo = AppDataSource.getRepository("RespuestaVotacion");

export const obtenerVotaciones = async () => {
  return await votacionRepo.find({
    relations: {
      opciones: true,
    },
    order: {
      fechaCreacion: "DESC",
    },
  });
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

  // Actualizar estado de votación
  await votacionRepo.update(
    { id: votacionId },
    { 
      estado: "cerrada",
      fechaCierre: new Date()
    }
  );

  // Borrar todos los tokens de esta votación
  await AppDataSource.getRepository("TokenVotacion").delete({
    votacion: { id: votacionId }
  });

  return { mensaje: "Votación cerrada correctamente" };
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
      estado: votacion.estado
    },
    resultados
  };
};