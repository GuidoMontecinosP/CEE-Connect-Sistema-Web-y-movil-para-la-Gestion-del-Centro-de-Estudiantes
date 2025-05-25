import * as VotoService from "../services/votacionrespuesta.services.js";

export const emitirVoto = async (req, res) => {
  try {
    const { usuarioId, votacionId, opcionId } = req.body;
    const resultado = await VotoService.emitirVoto({ usuarioId, votacionId, opcionId });
    res.status(201).json(resultado);
  } catch (error) {
    console.error("Error al emitir voto:", error);
    res.status(400).json({ error: error.message });
  }
};
