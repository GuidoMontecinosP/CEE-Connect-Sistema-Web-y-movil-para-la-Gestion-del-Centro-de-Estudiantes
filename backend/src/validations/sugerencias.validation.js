"use strict";

import Joi from "joi";

// Categorías válidas para las sugerencias
const CATEGORIAS_VALIDAS = [
  "general",
  "infraestructura", 
  "servicios",
  "eventos",
  "seguridad",
  "academico",
  "bienestar",
  "deportes",
  "cultura",
  "otros"
];

// Estados válidos para las sugerencias
const ESTADOS_VALIDOS = [
  "pendiente",
  "en proceso", 
  "resuelta",
  "archivada"
];

// Middleware simple para validar con Joi
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const data = req[property];
    const { error } = schema.validate(data, { abortEarly: false });
    
    if (error) {
      return res.status(400).json({
  success: false,
  message: "Errores de validación",
  errors: error.details.map(d => d.message).join(', ')
});

    }
    
    next();
  };
};

// Esquemas de validación con Joi
export const esquemaCrearSugerencia = Joi.object({
 autorId: Joi.alternatives()
    .try(
      Joi.string(),
      Joi.number().integer()
    )
    .required()
    .messages({
      'alternatives.match': 'El autorId debe ser un string o número',
      'any.required': 'El autor es obligatorio'
    }),


  titulo: Joi.string()
    .trim()
    .min(5)
    .max(200)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)
    .pattern(/^(?!.*\s{2,}).*$/)
    .required()
    .messages({
      'string.empty': 'El título es obligatorio',
      'string.min': 'El título debe tener al menos 5 caracteres',
      'string.max': 'El título no puede exceder los 200 caracteres',
      'string.pattern.base': 'El título solo puede contener letras y espacios simples, sin símbolos ni números',
      'any.required': 'El título es obligatorio'
    }),
  
  mensaje: Joi.string()
    .trim()
    .min(10)
    .max(500)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s.,;:!?¡¿()-]+$/)
    .pattern(/^(?!.*\s{2,}).*$/)
    .required()
    .messages({
      'string.empty': 'El mensaje es obligatorio',
      'string.min': 'El mensaje debe tener al menos 10 caracteres',
      'string.max': 'El mensaje no puede exceder los 500 caracteres',
      'string.pattern.base': 'El mensaje contiene caracteres no permitidos o espacios dobles',
      'any.required': 'El mensaje es obligatorio'
    }),
  
  categoria: Joi.string()
    .valid(...CATEGORIAS_VALIDAS)
    .required()
    .messages({
      'any.only': `La categoría debe ser una de: ${CATEGORIAS_VALIDAS.join(", ")}`,
      'any.required': 'La categoría es obligatoria'
    }),
  
  contacto: Joi.string()
    .trim()
    .max(100)
    .allow('',null)
    
    .optional()
    .messages({
      'string.max': 'El contacto no puede exceder los 100 caracteres'
    })
});

export const esquemaActualizarSugerencia = Joi.object({
  titulo: Joi.string()
    .trim()
    .min(5)
    .max(200)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)
    .pattern(/^(?!.*\s{2,}).*$/)
    .optional()
    .messages({
      'string.min': 'El título debe tener al menos 5 caracteres',
      'string.max': 'El título no puede exceder los 200 caracteres',
      'string.pattern.base': 'El título solo puede contener letras y espacios simples, sin símbolos ni números'
    }),
  
  mensaje: Joi.string()
    .trim()
    .min(10)
    .max(500)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s.,;:!?¡¿()-]+$/)
    .pattern(/^(?!.*\s{2,}).*$/)
    .optional()
    .messages({
      'string.min': 'El mensaje debe tener al menos 10 caracteres',
      'string.max': 'El mensaje no puede exceder los 500 caracteres',
      'string.pattern.base': 'El mensaje contiene caracteres no permitidos o espacios dobles'
    }),
  
  categoria: Joi.string()
    .valid(...CATEGORIAS_VALIDAS)
    .optional()
    .messages({
      'any.only': `La categoría debe ser una de: ${CATEGORIAS_VALIDAS.join(", ")}`
    }),
  
  contacto: Joi.string()
    .trim()
    .max(100)
    .allow('')
    .optional()
    .messages({
      'string.max': 'El contacto no puede exceder los 100 caracteres'
    })
});

export const esquemaResponderSugerencia = Joi.object({
  respuesta: Joi.string()
    .trim()
    .min(10)
    .max(500)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s.,;:!?¡¿()-]+$/)
    .pattern(/^(?!.*\s{2,}).*$/)
    .required()
    .messages({
      'string.empty': 'La respuesta es obligatoria',
      'string.min': 'La respuesta debe tener al menos 10 caracteres',
      'string.max': 'La respuesta no puede exceder los 500 caracteres',
      'string.pattern.base': 'La respuesta contiene caracteres no permitidos o espacios dobles',
      'any.required': 'La respuesta es obligatoria'
    }),
  
  estado: Joi.string()
    .valid(...ESTADOS_VALIDOS)
    .optional()
    .messages({
      'any.only': `El estado debe ser uno de: ${ESTADOS_VALIDOS.join(", ")}`
    })
});

export const esquemaIdSugerencia = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'ID debe ser un número',
      'number.integer': 'ID debe ser un número entero',
      'number.positive': 'ID debe ser un número positivo',
      'any.required': 'ID es obligatorio'
    })
});

export const esquemaPaginacion = Joi.object({
  page: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'La página debe ser un número',
      'number.integer': 'La página debe ser un número entero',
      'number.positive': 'La página debe ser un número positivo'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'number.base': 'El límite debe ser un número',
      'number.integer': 'El límite debe ser un número entero',
      'number.min': 'El límite debe ser al menos 1',
      'number.max': 'El límite no puede exceder 100'
    }),
  
  categoria: Joi.string()
    .valid(...CATEGORIAS_VALIDAS)
    .optional()
    .messages({
      'any.only': `La categoría debe ser una de: ${CATEGORIAS_VALIDAS.join(", ")}`
    }),
  
  estado: Joi.string()
    .valid(...ESTADOS_VALIDOS)
    .optional()
    .messages({
      'any.only': `El estado debe ser uno de: ${ESTADOS_VALIDOS.join(", ")}`
    })
});

export const esquemaFiltrosAdmin = Joi.object({
  page: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'La página debe ser un número',
      'number.integer': 'La página debe ser un número entero',
      'number.positive': 'La página debe ser un número positivo'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'number.base': 'El límite debe ser un número',
      'number.integer': 'El límite debe ser un número entero',
      'number.min': 'El límite debe ser al menos 1',
      'number.max': 'El límite no puede exceder 100'
    }),
  
  isReportada: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isReportada debe ser true o false'
    }),
  
  minReportes: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'minReportes debe ser un número',
      'number.integer': 'minReportes debe ser un número entero',
      'number.min': 'minReportes debe ser cero o positivo'
    })
});

export const esquemaActualizarRespuesta = Joi.object({
  respuesta: Joi.string()
    .trim()
    .min(10)
    .max(500)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s.,;:!?¡¿()-]+$/)
    .pattern(/^(?!.*\s{2,}).*$/)
    .required()
    .messages({
      'string.empty': 'La respuesta es obligatoria',
      'string.min': 'La respuesta debe tener al menos 10 caracteres',
      'string.max': 'La respuesta no puede exceder los 500 caracteres',
      'string.pattern.base': 'La respuesta contiene caracteres no permitidos o espacios dobles',
      'any.required': 'La respuesta es obligatoria'
    }),

  
  estado: Joi.string()
    .valid(...ESTADOS_VALIDOS)
    .optional()
    .messages({
      'any.only': `El estado debe ser uno de: ${ESTADOS_VALIDOS.join(", ")}`
    })
});

export const esquemaCambiarEstado = Joi.object({
  estado: Joi.string()
    .valid(...ESTADOS_VALIDOS)
    .required()
    .messages({
      'any.only': `El estado debe ser uno de: ${ESTADOS_VALIDOS.join(", ")}`,
      'any.required': 'El estado es obligatorio'
    })
});

// Middlewares de validación listos para usar
export const validarCrearSugerencia = validate(esquemaCrearSugerencia);
export const validarActualizarSugerencia = validate(esquemaActualizarSugerencia);
export const validarResponderSugerencia = validate(esquemaResponderSugerencia);
export const validarIdSugerencia = validate(esquemaIdSugerencia, 'params');
export const validarPaginacion = validate(esquemaPaginacion, 'query');
export const validarFiltrosAdmin = validate(esquemaFiltrosAdmin, 'query');
export const validarActualizarRespuesta = validate(esquemaActualizarRespuesta);
export const validarCambiarEstado = validate(esquemaCambiarEstado);

export { CATEGORIAS_VALIDAS, ESTADOS_VALIDOS };