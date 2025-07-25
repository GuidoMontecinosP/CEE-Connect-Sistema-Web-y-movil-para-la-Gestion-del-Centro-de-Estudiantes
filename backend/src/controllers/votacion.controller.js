import { 
  obtenerVotaciones, 
  crearVotacion, 
  obtenerVotacionPorId, 
  cerrarVotacion, 
  obtenerResultados,
  obtenerParticipantes,
  publicarResultados,
  obtenerVotacionesPorEstado,
  buscarVotaciones
} from "../services/votacion.services.js";
import { 
  emitirVoto, 
  verificarSiYaVoto 
} from "../services/voto.service.js";
import 
  crearVotacionValidation from "../validations/votacion.validation.js";
  
export const getVotaciones = async (req, res) => {
  try {
    // Obtener parámetros de paginación y filtros desde query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const estado = req.query.estado;
    const busqueda = req.query.busqueda;
    const resultadosPublicados = req.query.resultadosPublicados;

    // Construir objeto de filtros
    const filtros = {};
    if (resultadosPublicados !== undefined) {
      filtros.resultadosPublicados = resultadosPublicados === 'true';
    }
    if (busqueda) {
      filtros.busqueda = busqueda.trim();
    }

    let resultado;
    
    if (busqueda && !estado) {
      // Búsqueda general sin filtro de estado
      resultado = await buscarVotaciones(busqueda.trim(), page, limit, {
        resultadosPublicados: filtros.resultadosPublicados
      });
    } else if (estado && !busqueda) {
      // Filtro solo por estado
      resultado = await obtenerVotacionesPorEstado(estado, page, limit, filtros);
    } else if (estado && busqueda) {
      // Búsqueda con filtro de estado
      resultado = await buscarVotaciones(busqueda.trim(), page, limit, {
        estado,
        resultadosPublicados: filtros.resultadosPublicados
      });
    } else {
      // Obtener todas las votaciones con filtros opcionales
      resultado = await obtenerVotaciones(page, limit, filtros);
    }

    res.json({
      success: true,
      ...resultado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener votaciones",
      error: error.message
    });
  }
};

export const createVotacion = async (req, res) => {
  //console.log('Datos recibidos:', req.body); // Para depuración, ver qué datos se reciben
  try {
    // VALIDAR datos con Joi
    const { error, value } = crearVotacionValidation.validate(req.body);
    
    if (error) {
    //  console.log('Errores de validación:', error.details);
      return res.status(400).json({
        success: false,
        message: "Datos de entrada inválidos",
        errors: error.details.map(detail => detail.message)
      });
    }

    // Usar los datos validados (value contiene los datos limpios)
    const { titulo, opciones } = value;

    const nuevaVotacion = await crearVotacion({ titulo, opciones });
    
    res.status(201).json({
      success: true,
      message: "Votación creada exitosamente",
      data: nuevaVotacion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message
    });
  }
};

export const getVotacionById = async (req, res) => {
  try {
    const { id } = req.params;
    const votacion = await obtenerVotacionPorId(id);
    
    if (!votacion) {
      return res.status(404).json({
        success: false,
        message: "Votación no encontrada"
      });
    }

    res.json({
      success: true,
      data: votacion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener votación",
      error: error.message
    });
  }
};

export const votar = async (req, res) => {
  try {
    const { id: votacionId } = req.params;
    const { usuarioId, opcionId } = req.body;
    
    // console.log("Datos recibidos para votar:", {
    //   usuarioId,
    //   votacionId,
    //   opcionId
    // });

    // Validación mejorada
    if (!usuarioId || !opcionId) {
      return res.status(400).json({
        success: false,
        message: "Usuario ID y Opción ID son requeridos"
      });
    }

    // Validar que sean números válidos
    const userIdNum = parseInt(usuarioId);
    const votacionIdNum = parseInt(votacionId);
    const opcionIdNum = parseInt(opcionId);

    if (isNaN(userIdNum) || isNaN(votacionIdNum) || isNaN(opcionIdNum)) {
      return res.status(400).json({
        success: false,
        message: "Los IDs deben ser números válidos"
      });
    }

    const resultado = await emitirVoto({
      usuarioId: userIdNum,
      votacionId: votacionIdNum,
      opcionId: opcionIdNum
    });

    res.json({
      success: true,
      message: resultado.mensaje,
      data: {
        votacionId: votacionIdNum,
        fechaVoto: new Date().toISOString()
      }
    });
  } catch (error) {
    const statusCode = error.message.includes("ya ha votado") ? 409 : 
                      error.message.includes("no encontrado") ? 404 : 
                      error.message.includes("no válido") ? 403 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

export const verificarVoto = async (req, res) => {
  try {
    const { id: votacionId, usuarioId } = req.params;
    
    // Validar parámetros
    const userIdNum = parseInt(usuarioId);
    const votacionIdNum = parseInt(votacionId);

    if (isNaN(userIdNum) || isNaN(votacionIdNum)) {
      return res.status(400).json({
        success: false,
        message: "Los IDs deben ser números válidos"
      });
    }

    const resultado = await verificarSiYaVoto(userIdNum, votacionIdNum);

    res.json({
      success: true,
      data: {
        usuarioId: userIdNum,
        votacionId: votacionIdNum,
        yaVoto: resultado.yaVoto,
        fechaVoto: resultado.fechaVoto
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al verificar voto",
      error: error.message
    });
  }
};

export const cerrarVotacionController = async (req, res) => {
  try {
    const { id } = req.params;
    
    const resultado = await cerrarVotacion(parseInt(id));

    res.json({
      success: true,
      message: resultado.mensaje
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getResultados = async (req, res) => {
  try {
    const { id } = req.params;
    
    const resultados = await obtenerResultados(parseInt(id));

    res.json({
      success: true,
      data: resultados
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener resultados",
      error: error.message
    });
  }
};

export const getParticipantes = async (req, res) => {
  try {
    const votacionId = parseInt(req.params.id, 10);
    if (isNaN(votacionId)) {
      return res.status(400).json({ 
        success: false, 
        message: "ID inválido" 
      });
    }

    // Obtener parámetros de paginación y filtros
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const busqueda = req.query.busqueda;

    // Construir objeto de filtros
    const filtros = {};
    if (busqueda) {
      filtros.busqueda = busqueda.trim();
    }

    const resultado = await obtenerParticipantes(votacionId, page, limit, filtros);
    
    return res.json({ 
      success: true, 
      ...resultado 
    });
  } catch (error) {
    const code = error.message.includes("no encontrada") ? 404 : 500;
    return res.status(code).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const putPublicarResultados = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await publicarResultados(id);
    res.json({
      success: true,
      ...resultado
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};
