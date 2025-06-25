"use strict";
import Joi from "joi";

// Para CREAR votación - sin id (se genera automáticamente)
export const crearVotacionValidation = Joi.object({
  titulo: Joi.string()
    .min(10)
    .max(300)
    .trim()
    .pattern(/^(?!.*\s{2})(?!\s)(?!.*\s$)[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\d.,;:¿?¡!()-]+$/)
    .required()
    .messages({
      "string.empty": "El título de la votación no puede estar vacío.",
      "string.base": "El título debe ser un texto.",
      "string.min": "El título debe tener al menos 10 caracteres.",
      "string.max": "El título no puede exceder los 300 caracteres.",
      "string.pattern.base": "El título contiene caracteres no permitidos",
      "any.required": "El título es obligatorio.",
    }),


opciones: Joi.array()
  .items(
    Joi.string()
      .trim()
      .min(1)
      .max(100)
      .pattern(/^(?!.*\s{2})[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\d.,;:¿?¡!()-]+$/)
      .required()
      .messages({
        "string.empty": "El texto de la opción no puede estar vacío.",
        "string.min": "El texto de la opción debe tener al menos 1 caracter.",
        "string.max": "El texto de la opción no puede exceder 100 caracteres.",
        "string.pattern.base": "El texto de la opción contiene caracteres no permitidos.",
        "any.required": "El texto de la opción es obligatorio.",
      })
  )
  .min(2)
  .max(10)
   .unique()
  .required()
 
  .messages({
    "array.unique": "Las opciones deben ser únicas.",
    "array.min": "Debe haber al menos 2 opciones.",
    "array.max": "No puede haber más de 10 opciones.",
    "any.required": "Las opciones son obligatorias.",
  }),

});
export default crearVotacionValidation;