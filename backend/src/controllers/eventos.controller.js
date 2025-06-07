import { crearEvento, modificarEvento, eventos } from "../services/eventos.services.js";

export async function crearEventoController(req, res) {
  try {
    
    const { titulo, descripcion, fecha, hora, lugar, tipo } = req.body;
    const evento = await crearEvento({
      titulo,
      descripcion,
      fecha,
      hora,
      lugar,
      tipo,
    });

    res.status(201).json({
      message: "Evento creado exitosamente",
      evento,
    });
  } catch (error) {
    console.error("Error al crear el evento:", error);
    res.status(500).json({ error: "Error al crear el evento" });
  }
}

export async function modificarEventoController(req, res) {
  try {
    const { id } = req.params;
    const { titulo, descripcion, fecha, hora, lugar, tipo, estado } = req.body;

    const eventoModificado = await modificarEvento(id, {
      titulo,
      descripcion,
      fecha,
      hora,
      lugar,
      tipo,
      estado,
    });

    res.status(200).json({
      message: "Evento modificado exitosamente",
      evento: eventoModificado,
    });
  } catch (error) {
    console.error("Error al modificar el evento:", error);
    res.status(500).json({ error: "Error al modificar el evento" });
  }
}

export async function eventosController(req, res) {
  try {
    const listaEventos = await eventos();

    res.status(200).json(listaEventos);

  } catch (error) {
    console.error("Error al obtener los eventos:", error);
    res.status(500).json({ error: "Error al obtener los eventos" });
  }
}