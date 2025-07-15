
import { AppDataSource } from "../config/configDb.js";
import ReporteSugerenciaSchema from "../entity/reporteSugerencia.entity.js";
import SugerenciaSchema from "../entity/sugerencia.entity.js";
import UsuarioSchema from "../entity/usuario.entity.js";

const reporteRepo = AppDataSource.getRepository(ReporteSugerenciaSchema);
const sugerenciaRepo = AppDataSource.getRepository(SugerenciaSchema);
const usuarioRepo = AppDataSource.getRepository(UsuarioSchema);

export const reporteService = {
  async crearReporte(userId, sugerenciaId, motivo) {
    const usuario = await usuarioRepo.findOne({ where: { id: userId } });
    const sugerencia = await sugerenciaRepo.findOne({ where: { id: sugerenciaId } });

    if (!usuario || !sugerencia) throw new Error("Usuario o sugerencia no encontrada");

    const existente = await reporteRepo.findOne({
      where: {
        usuario: { id: userId },
        sugerencia: { id: sugerenciaId }
      }
    });

    if (existente) throw new Error("Ya reportaste esta sugerencia");

    const nuevo = reporteRepo.create({ usuario, sugerencia, motivo });
    await reporteRepo.save(nuevo);

    // Opcional: marcar sugerencia como reportada
    sugerencia.isReportada = true;
    await sugerenciaRepo.save(sugerencia);

    return nuevo;
  },

  async obtenerReportes(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await reporteRepo.findAndCount({ skip, take: limit });
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async eliminarReporte(id) {
    const reporte = await reporteRepo.findOne({ where: { id } });
    if (!reporte) throw new Error("Reporte no encontrado");
    await reporteRepo.remove(reporte);
  },

  async vaciarReportesDeSugerencia(sugerenciaId) {
    const sugerencia = await sugerenciaRepo.findOne({ where: { id: sugerenciaId } });
    if (!sugerencia) throw new Error("Sugerencia no encontrada");

    await reporteRepo.delete({ sugerencia: { id: sugerenciaId } });
    sugerencia.isReportada = false;
    await sugerenciaRepo.save(sugerencia);
  }
  ,
  async obtenerReportesPorUsuario(userId) {
    const reportes = await reporteRepo.find({
      where: { usuario: { id: userId } },
      relations: ['sugerencia']
    });
    
    // Devolver solo los IDs de las sugerencias reportadas por este usuario
    return reportes.map(r => r.sugerencia.id);
  },
};

 