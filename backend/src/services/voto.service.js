import { AppDataSource } from "../config/configDb.js";
const votacionRepo = AppDataSource.getRepository("Votacion");
const respuestaRepo = AppDataSource.getRepository("RespuestaVotacion");
const tokenRepo = AppDataSource.getRepository("TokenVotacion");
const usuarioRepo = AppDataSource.getRepository("Usuario");
const opcionRepo = AppDataSource.getRepository("OpcionVotacion");


export const emitirVoto = async ({ usuarioId, votacionId, opcionId }) => {
  const { randomUUID } = await import('crypto');

  // Verificar que la votación existe y está activa
  const votacion = await votacionRepo.findOneBy({ 
    id: parseInt(votacionId), 
    estado: "activa" 
  });
  
  if (!votacion) {
    throw new Error("Votación no encontrada o ya cerrada");
  }

  // Verificar que el usuario existe
  const usuario = await usuarioRepo.findOneBy({ id: parseInt(usuarioId) });
  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }

  // Verificar que la opción existe y pertenece a la votación
  const opcion = await opcionRepo.findOne({
    where: { 
      id: parseInt(opcionId),
      votacion: { id: parseInt(votacionId) }
    }
  });

  if (!opcion) {
    throw new Error("Opción inválida");
  }

  // Verificar si ya votó
 const tokenExistente = await tokenRepo.findOne({
    where: {
      usuario: { id: parseInt(usuarioId) },
      votacion: { id: parseInt(votacionId) }
    }
  });

  if (tokenExistente) {
    throw new Error("El usuario ya ha votado en esta votación");
  }

  const token = randomUUID();
  
  // Guardar token (sin yaVoto)
  await tokenRepo.save({
    token: token,
    usuario: { id: parseInt(usuarioId) },
    votacion: { id: parseInt(votacionId) }
  });

  // Registrar voto
  await respuestaRepo.save({
    tokenVotacion: token,
    opcion: { id: parseInt(opcionId) }
  });

  return { mensaje: "Voto registrado correctamente" };
};


export const verificarSiYaVoto = async (usuarioId, votacionId) => {
  const token = await tokenRepo.findOne({
    where: {
      usuario: { id: parseInt(usuarioId) },
      votacion: { id: parseInt(votacionId) }
    }
  });

  return {
    yaVoto: !!token 
  };
};
