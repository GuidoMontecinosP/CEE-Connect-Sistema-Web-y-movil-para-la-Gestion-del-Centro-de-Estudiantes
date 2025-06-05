import { AppDataSource } from "../config/configDb.js";

const usuarioRepo = AppDataSource.getRepository("Usuario");
const eventoRepo = AppDataSource.getRepository("Evento");

export const crearEvento = async (data) => {
  const { titulo, descripcion, fecha, lugar, tipo } = data;

//   const creador = await usuarioRepo.findOneBy({ id: creadaPorId });
//   if (!creador) throw new Error("Usuario creador no encontrado"); // revisar

  const nuevoEvento = eventoRepo.create({
    titulo,
    descripcion,
    fecha: new Date(fecha),
    lugar,
    tipo,
  });

  return await eventoRepo.save(nuevoEvento);
};

export const modificarEvento = async (id, data) => {
    //primero verificamos si el evento existe
    const evento = await eventoRepo.findOneBy({ id });
    if (!evento) throw new Error("Evento no encontrado");

    const { titulo, descripcion, fecha, lugar, tipo, estado } = data;

    evento.titulo = titulo || evento.titulo;
    evento.descripcion = descripcion || evento.descripcion;
    evento.fecha = fecha ? new Date(fecha) : evento.fecha;
    evento.lugar = lugar || evento.lugar;
    evento.tipo = tipo || evento.tipo;
    evento.estado = estado || evento.estado;

    return await eventoRepo.save(evento);
};

export const eventos = async () => {
    const eventos = await eventoRepo.find();
    return eventos;
}