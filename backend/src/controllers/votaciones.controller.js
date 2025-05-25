import * as VotacionService from "../services/votaciones.services.js";

export const getVotaciones = async (req, res) => {
  try {
    const votaciones = await VotacionService.obtenerVotaciones();
    res.json(votaciones);
  } catch (error) {
    console.error("Error al obtener votaciones:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const crearVotacion = async (req, res) => {
  try {
    const nuevaVotacion = await VotacionService.crearVotacion(req.body);
    res.status(201).json(nuevaVotacion);
  } catch (error) {
    console.error("Error al crear votación:", error);
    res.status(400).json({ error: error.message });
  }
};

export const getVotacionPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const votacion = await VotacionService.obtenerVotacionPorId(id);
    if (!votacion) {
      return res.status(404).json({ error: "Votación no encontrada" });
    }
    res.json(votacion);
  } catch (error) {
    console.error("Error al obtener votación:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
