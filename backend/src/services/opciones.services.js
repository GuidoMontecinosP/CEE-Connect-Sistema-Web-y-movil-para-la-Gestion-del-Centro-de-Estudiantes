import { AppDataSource } from "../config/configDb.js";


const votacionRepo = AppDataSource.getRepository("Votacion");
const opcionRepo = AppDataSource.getRepository("OpcionVotacion");

export const crearOpcionesParaVotacion = async (votacionId, listaOpciones) => {
  const votacion = await votacionRepo.findOneBy({ id: parseInt(votacionId) }); // Buscar la votación por ID 

  if (!votacion) throw new Error("Votación no encontrada"); // Si no se encuentra la votación, lanzar un error

  const opciones = listaOpciones.map(texto =>
    opcionRepo.create({ textoOpcion: texto, votacion })
  );

  return await opcionRepo.save(opciones);
};
