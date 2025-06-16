import { 
  obtenerVotaciones, 
  crearVotacion, 
  obtenerVotacionPorId, 
  cerrarVotacion, 
  obtenerResultados 
} from "../services/votacion.services.js";
import { 
  emitirVoto, 
  verificarSiYaVoto 
} from "../services/voto.service.js";
import 
  crearVotacionValidation from "../validations/votacion.validation.js";
  
export const getVotaciones = async (req, res) => {
  try {
    const votaciones = await obtenerVotaciones();
    res.json({
      success: true,
      data: votaciones
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
  console.log('Datos recibidos:', req.body); // Para depuración, ver qué datos se reciben
  try {
    // VALIDAR datos con Joi
    const { error, value } = crearVotacionValidation.validate(req.body);
    
    if (error) {
      console.log('Errores de validación:', error.details);
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
    console.log(" Datos recibidos para votar:", {
      usuarioId,
      votacionId,
      opcionId
    });


    if (!usuarioId || !opcionId) {
      return res.status(400).json({
        success: false,
        message: "Usuario ID y Opción ID son requeridos"
      });
    }

    const resultado = await emitirVoto({
      usuarioId: parseInt(usuarioId),
      votacionId: parseInt(votacionId),
      opcionId: parseInt(opcionId)
    });

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

export const verificarVoto = async (req, res) => {
  try {
    const { id: votacionId, usuarioId } = req.params;
    
    const resultado = await verificarSiYaVoto(
      parseInt(usuarioId), 
      parseInt(votacionId)
    );

    res.json({
      success: true,
      data: resultado
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
