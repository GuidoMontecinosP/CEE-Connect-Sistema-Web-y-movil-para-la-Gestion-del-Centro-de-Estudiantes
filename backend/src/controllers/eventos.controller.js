import { crearEvento, modificarEvento, eventos, eliminarEvento } from "../services/eventos.services.js";
import { crearEventoValidation, modificarEventoValidation } from "../validations/eventos.validation.js";

export async function crearEventoController(req, res) {
  const {error, value} = crearEventoValidation.validate(req.body);
  if (error) {
    console.log("Error de validación:", error.details);
    return res.status(400).json({
        success: false,
        message: error.details[0].message,
        errors: error.details.map(detail => detail.message)
      });
  }

  try {
    const { titulo, descripcion, fecha, hora, lugar, tipo } = value;
    const evento = await crearEvento({
      titulo,
      descripcion,
      fecha,
      hora,
      lugar,
      tipo,
    });

    res.status(201).json({
      success: true,
      message: "Evento creado exitosamente",
      evento,
    });
  } catch (error) {
    console.error("Error al crear el evento:", error);
    res.status(500).json({ error: "Error al crear el evento" });
  }
}

export async function modificarEventoController(req, res) {
  console.log("req.body:", req.body);
  console.log("req.params:", req.params);

  const {error, value} = modificarEventoValidation.validate(req.body);
  if (error) {
    console.log("Error de validación:", error.details);
    return res.status(400).json({
        success: false,
        message: error.details[0].message,
        errors: error.details.map(detail => detail.message)
      });
  }

  try {
    const { id } = req.params;
    const { titulo, descripcion, fecha, hora, lugar, tipo, estado } = value;

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

export async function eliminarEventoController(req, res) {
  try {
    const { id } = req.params;
    await eliminarEvento(id);
    res.status(200).json({ message: "Evento eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar el evento:", error);
    res.status(500).json({ error: "Error al eliminar el evento" });
  }
}