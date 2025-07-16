
import { handleSuccess, handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";
import { reporteService } from "../services/reporte.service.js";

export const crearReporte = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sugerenciaId, motivo } = req.body;
    const nuevo = await reporteService.crearReporte(userId, sugerenciaId, motivo);
    handleSuccess(res, 201, "Reporte creado", nuevo);
  } catch (err) {
    console.error("Error creando reporte:", err);
    const status = err.message.includes("Ya reportaste") ? 400 : 404;
    handleErrorClient(res, status, err.message);
  }
};

export const obtenerReportes = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await reporteService.obtenerReportes(parseInt(page), parseInt(limit));
    handleSuccess(res, 200, "Reportes obtenidos", result);
  } catch (err) {
    console.error("Error obteniendo reportes:", err);
    handleErrorServer(res);
  }
};

export const eliminarReporte = async (req, res) => {
  try {
    await reporteService.eliminarReporte(parseInt(req.params.id));
    handleSuccess(res, 200, "Reporte eliminado");
  } catch (err) {
    console.error("Error eliminando reporte:", err);
    handleErrorClient(res, 404, err.message);
  }
};
export const obtenerMisReportes = async (req, res) => {
  try {
    const userId = req.user.id;
    const sugerenciasReportadas = await reporteService.obtenerReportesPorUsuario(userId);
    res.json({
      success: true,
      data: sugerenciasReportadas,
      message: `${sugerenciasReportadas.length} sugerencias reportadas por este usuario`
    });
  } catch (error) {
    console.error('Error al obtener reportes del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reportes del usuario'
    });
  }
}

export const vaciarReportes = async (req, res) => {
  try {
    await reporteService.vaciarReportesDeSugerencia(parseInt(req.params.sugerenciaId));
    handleSuccess(res, 200, "Reportes eliminados de la sugerencia");
  } catch (err) {
    console.error("Error vaciando reportes:", err);
    handleErrorClient(res, 404, err.message);
  }
};
