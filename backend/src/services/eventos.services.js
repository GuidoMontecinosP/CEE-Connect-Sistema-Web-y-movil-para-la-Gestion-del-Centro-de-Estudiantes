import { AppDataSource } from "../config/configDb.js";

const eventoRepo = AppDataSource.getRepository("Evento");

export const crearEvento = async (data) => {
  const { titulo, descripcion, fecha, hora, lugar, tipo } = data;

  const nuevoEvento = eventoRepo.create({
    titulo,
    descripcion,
    fecha,
    hora,
    lugar,
    tipo,
  });

  return await eventoRepo.save(nuevoEvento);
};

export const modificarEvento = async (id, data) => {
    //primero verificamos si el evento existe
    const evento = await eventoRepo.findOneBy({ id });
    if (!evento) throw new Error("Evento no encontrado");

    const { titulo, descripcion, fecha, hora, lugar, tipo, estado } = data;

    evento.titulo = titulo || evento.titulo;
    evento.descripcion = descripcion || evento.descripcion;
    evento.fecha = fecha || evento.fecha;
    evento.hora = hora || evento.hora;
    evento.lugar = lugar || evento.lugar;
    evento.tipo = tipo || evento.tipo;
    evento.estado = estado || evento.estado;

    return await eventoRepo.save(evento);
};

export const eventos = async () => {
    const eventos = await eventoRepo.find({
        where: { estado: "activo" },
      order: {
        fecha: "ASC",
        hora: "ASC"
      }
    });
    return eventos;
}

export const eliminarEvento = async (id) => {
    try {
      const resultado = await eventoRepo.delete(id);
      if (resultado.affected === 0) {
        throw new Error("Evento no encontrado o ya ha sido eliminado");
      }

      return { message: "Evento eliminado exitosamente" };

    } catch (error) {
        console.error("Error al eliminar el evento:", error.message);
        throw new Error("Error al eliminar el evento");  
    }
}