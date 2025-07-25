"use strict";
import Joi from "joi";

// ✅ Validador personalizado para el dominio institucional
const domainEmailValidator = (value, helper) => {
  if (!value.endsWith("@alumnos.ubiobio.cl")) {
    return helper.message("El correo debe ser institucional (@alumnos.ubiobio.cl).");
  }
  return value;
};

//  Validación para LOGIN
export const authValidation = Joi.object({
  correo: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .min(15)
    .max(60)
    .required()
    .custom(domainEmailValidator, "Dominio institucional")
    .messages({
      "string.email": "El correo debe tener un formato válido.",
      "string.empty": "El correo no puede estar vacío.",
      "any.required": "El correo es obligatorio.",
      "string.min": "El correo debe tener al menos 15 caracteres.",
      "string.max": "El correo debe tener como máximo 60 caracteres.",
    }),

  
  contrasena: Joi.string()
    .min(8)
    .max(50)
    .pattern(/^[a-zA-Z0-9!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]+$/)
    .required()
    .messages({
      "string.empty": "La contraseña no puede estar vacía.",
      "any.required": "La contraseña es obligatoria.",
      "string.min": "La contraseña debe tener al menos 8 caracteres.",
      "string.max": "La contraseña debe tener como máximo 50 caracteres.",
      "string.pattern.base": "La contraseña contiene caracteres inválidos.",
    }),
}).unknown(false).messages({
  "object.unknown": "No se permiten propiedades adicionales.",
});

// Validación para REGISTRO
export const registerValidation = Joi.object({
  nombre: Joi.string()
    .min(3)
    .max(50)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .required()
    .messages({
      "string.min": "El nombre debe tener al menos 3 caracteres.",
      "string.max": "El nombre debe tener como máximo 50 caracteres.",
      "string.pattern.base": "El nombre solo puede contener letras y espacios.",
      "string.empty": "El nombre no puede estar vacío.",
      "any.required": "El nombre es obligatorio.",
      "string.pattern.base": "El nombre solo puede contener letras y espacios.",
    }),

  correo: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .min(21)
    .max(60)
    .required()
    .custom(domainEmailValidator, "Dominio institucional")
    .messages({
      "string.pattern.base": "El correo debe ser institucional (@alumnos.ubiobio.cl).",
      "string.empty": "El correo no puede estar vacío.",
      "any.required": "El correo es obligatorio.",
      "string.email": "El correo debe tener un formato válido.",
      "string.min": "El correo debe tener al menos 21 caracteres.",
      "string.max": "El correo debe tener como máximo 60 caracteres.",
    }),

  contrasena: Joi.string()
    .min(8)
    .max(50)
    .pattern(/^[a-zA-Z0-9!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]+$/)
    .required()
    .messages({
      "string.empty": "La contraseña no puede estar vacía.",
      "any.required": "La contraseña es obligatoria.",
      "string.min": "La contraseña debe tener al menos 8 caracteres.",
      "string.max": "La contraseña debe tener como máximo 50 caracteres.",
      "string.pattern.base": "La contraseña contiene caracteres inválidos.",
    }),

  rolId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "number.empty": "El rol no puede estar vacío.",
      "number.base": "El rol debe ser un número entero.",
      "number.integer": "El rol debe ser un número entero.",
      "number.positive": "El rol debe ser un número positivo.",
      "any.required": "El rol es obligatorio.",
    }),
}).unknown(false).messages({
  "object.unknown": "No se permiten propiedades adicionales.",
});