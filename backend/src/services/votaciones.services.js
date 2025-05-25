import { AppDataSource } from "../config/configDb.js";


const votacionRepo = AppDataSource.getRepository("Votacion");
const usuarioRepo = AppDataSource.getRepository("Usuario");

export const obtenerVotaciones = async () => {
  return await votacionRepo.find({
    relations: {
      opciones: true,
      creadaPor: false,
    },
    order: {
      fechaInicio: "DESC",
    },
  });
};

export const crearVotacion = async (data) => {
  const { titulo, descripcion, fechaInicio, fechaFin, creadaPorId } = data;

  const creador = await usuarioRepo.findOneBy({ id: creadaPorId });
  if (!creador) throw new Error("Usuario creador no encontrado");

  const nuevaVotacion = votacionRepo.create({
    titulo,
    descripcion,
    fechaInicio: new Date(fechaInicio),
    fechaFin: new Date(fechaFin),
    creadaPor: creador,
  });

  return await votacionRepo.save(nuevaVotacion);
};

export const obtenerVotacionPorId = async (id) => {
  return await votacionRepo.findOne({
    where: { id: parseInt(id) },
    relations: {
      opciones: true,
      creadaPor: false,
    },
  });
};
