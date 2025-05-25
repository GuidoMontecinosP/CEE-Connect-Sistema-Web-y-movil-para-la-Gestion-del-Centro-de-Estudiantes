import { AppDataSource } from "../config/configDb.js";

const respuestaRepo = AppDataSource.getRepository("RespuestaVotacion");
const registroRepo = AppDataSource.getRepository("RegistroVotante");
const votacionRepo = AppDataSource.getRepository("Votacion");
const opcionRepo = AppDataSource.getRepository("OpcionVotacion");
const usuarioRepo = AppDataSource.getRepository("Usuario");

export const emitirVoto = async ({ usuarioId, votacionId, opcionId }) => {
  const usuario = await usuarioRepo.findOneBy({ id: usuarioId });
  const votacion = await votacionRepo.findOneBy({ id: votacionId });
  const opcion = await opcionRepo.findOneBy({ id: opcionId });

  if (!usuario || !votacion || !opcion) {
    throw new Error("Usuario, votación u opción inválida");
  }

  const yaVoto = await registroRepo.findOneBy({ usuario: { id: usuarioId }, votacion: { id: votacionId } });
  if (yaVoto) throw new Error("El usuario ya ha votado en esta votación");

  await respuestaRepo.save(
    respuestaRepo.create({
      votacion,
      opcion
    })
  );

  await registroRepo.save(
    registroRepo.create({
      usuario,
      votacion
    })
  );

  return { mensaje: "Voto registrado correctamente" };
};
