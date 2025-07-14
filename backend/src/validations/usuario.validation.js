"use strict";
import Joi from "joi";

// Validación de dominio institucional
const domainEmailValidator = (value, helper) => {
  if (!value.endsWith("@alumnos.ubiobio.cl")) {
    return helper.message(
      "El correo electrónico debe ser del dominio @alumnos.ubiobio.cl"
    );
  }
  return value;
};

// 🔍 Validación para consultas (GET)
export const userQueryValidation = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El id debe ser un número.",
      "number.integer": "El id debe ser un número entero.",
      "number.positive": "El id debe ser un número positivo.",
    }),
  correo: Joi.string()
    .min(15)
    .max(60)
    .email()
    .messages({
      "string.empty": "El correo no puede estar vacío.",
      "string.base": "El correo debe ser un texto.",
      "string.email": "El formato del correo es inválido.",
      "string.min": "El correo debe tener al menos 15 caracteres.",
      "string.max": "El correo debe tener como máximo 60 caracteres.",
    })
    .custom(domainEmailValidator, "Validación dominio correo"),
})
  .or("id", "correo")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing":
      "Debes proporcionar al menos un parámetro: id o correo.",
  });

// 📝 Validación para modificaciones (PATCH)
export const userBodyValidation = Joi.object({
  nombre: Joi.string()
    .min(3)
    .max(50)
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .messages({
      "string.empty": "El nombre no puede estar vacío.",
      "string.base": "El nombre debe ser un texto.",
      "string.min": "El nombre debe tener al menos 3 caracteres.",
      "string.max": "El nombre debe tener como máximo 50 caracteres.",
      "string.pattern.base": "El nombre solo puede contener letras y espacios.",
    }),

  correo: Joi.string()
    .min(15)
    .max(60)
    .email()
    .messages({
      "string.empty": "El correo no puede estar vacío.",
      "string.base": "El correo debe ser un texto.",
      "string.email": "El formato del correo es inválido.",
      "string.min": "El correo debe tener al menos 15 caracteres.",
      "string.max": "El correo debe tener como máximo 60 caracteres.",
    })
    .custom(domainEmailValidator, "Validación dominio correo"),

  contrasena: Joi.string()
    .min(8)
    .max(26)
    .pattern(/^[a-zA-Z0-9!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]+$/)
    .messages({
      "string.empty": "La contraseña actual no puede estar vacía.",
      "string.base": "La contraseña debe ser un texto.",
      "string.min": "Debe tener al menos 8 caracteres.",
      "string.max": "Debe tener como máximo 26 caracteres.",
      "string.pattern.base": "Solo se permiten letras y números.",
    }),

  nuevaContrasena: Joi.string()
    .min(8)
    .max(26)
    .allow("")
    .pattern(/^[a-zA-Z0-9!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]+$/)
    .messages({
      "string.base": "La nueva contraseña debe ser un texto.",
      "string.min": "Debe tener al menos 8 caracteres.",
      "string.max": "Debe tener como máximo 26 caracteres.",
      "string.pattern.base": "Solo se permiten letras y números.",
    }),

  rolId: Joi.number()
    .integer()
    .positive()
    .messages({
      "number.base": "El rol debe ser un número.",
      "number.integer": "El rol debe ser un número entero.",
      "number.positive": "El rol debe ser positivo.",
    }),

  estado: Joi.string()
    .valid("activo", "inactivo")
    .messages({
      "any.only": "El estado debe ser 'activo' o 'inactivo'.",
    }),
})
  .or("nombre", "correo", "contrasena", "newPassword", "rolId", "estado")
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten propiedades adicionales.",
    "object.missing":
      "Debes proporcionar al menos un campo: nombre, correo, contrasena, newPassword, rolId o estado.",
  });
