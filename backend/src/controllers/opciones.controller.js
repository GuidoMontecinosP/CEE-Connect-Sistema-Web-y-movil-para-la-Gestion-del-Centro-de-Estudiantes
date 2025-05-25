import * as OpcionService from "../services/opciones.services.js";

export const crearOpciones = async (req, res) => {
  try {
    const { votacionId, opciones } = req.body;
    const creadas = await OpcionService.crearOpcionesParaVotacion(votacionId, opciones); // Crear opciones para una votación
    res.status(201).json(creadas);
  } catch (error) {
    console.error("Error al crear opciones:", error);
    res.status(400).json({ error: error.message });
  }
};
