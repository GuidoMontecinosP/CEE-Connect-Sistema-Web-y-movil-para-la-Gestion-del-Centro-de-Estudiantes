"use strict";
import Joi from "joi";

export const crearAnuncioValidation = Joi.object({
    titulo: Joi.string()
        .min(5)
        .max(100)   
        .trim()
        .pattern(/^(?!.*\s{2})(?!\s)(?!.*\s$)[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\d.,;:¿?¡!()-]+$/)
        .required() 
        .messages({
            "string.empty": "El título del anuncio no puede estar vacío.",
            "string.base": "El título debe ser un texto.",
            "string.min": "El título debe tener al menos 5 caracteres.",
            "string.max": "El título no puede exceder los 100 caracteres.",
            "string.pattern.base": "El título contiene caracteres no permitidos",
            "any.required": "El título es obligatorio.",
        }),
    epilogo: Joi.string()
        .min(20)
        .max(500)
        .trim()
        .pattern(/^(?!.*\s{2})(?!\s)(?!.*\s$)[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\d.,;:¿?¡!()\-%]+$/)
        .required()
        .messages({
            "string.empty": "El epílogo del anuncio no puede estar vacío.",
            "string.base": "El epílogo debe ser un texto.",
            "string.min": "El epílogo debe tener al menos 20 caracteres.",
            "string.max": "El epílogo no puede exceder los 500 caracteres.",
            "string.pattern.base": "El epílogo contiene caracteres no permitidos",
            "any.required": "El epílogo es obligatorio.",
        }),
   
    link: Joi.string()
        .uri()
        .optional()
        .allow('')
        .messages({
            "string.uri": "El enlace debe ser una URL válida.",
        }),
    tipo: Joi.string()
        .valid("urgente", "avisos importantes", "otro")
        .required()
        .messages({
            "any.only": "El tipo de anuncio no es válido.",
            "any.required": "El tipo es obligatorio.",
        }),
})

export const modificarAnuncioValidation = Joi.object({
    titulo: Joi.string()
        .min(5)
        .max(100)
        .trim()
        .pattern(/^(?!.*\s{2})(?!\s)(?!.*\s$)[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\d.,;:¿?¡!()-]+$/)
        .optional()
        .allow("")
        .messages({
            "string.empty": "El título del anuncio no puede estar vacío.",
            "string.base": "El título debe ser un texto.",
            "string.min": "El título debe tener al menos 5 caracteres.",
            "string.max": "El título no puede exceder los 100 caracteres.",
            "string.pattern.base": "El título contiene caracteres no permitidos",
        }),
    epilogo: Joi.string()
        .min(20)
        .max(500)
        .trim()
        .pattern(/^(?!.*\s{2})(?!\s)(?!.*\s$)[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\d.,;:¿?¡!()\-%]+$/)
        .optional()
        .allow("")
        .messages({
            "string.empty": "El epílogo del anuncio no puede estar vacío.",
            "string.base": "El epílogo debe ser un texto.",
            "string.min": "El epílogo debe tener al menos 20 caracteres.",
            "string.max": "El epílogo no puede exceder los 500 caracteres.",
            "string.pattern.base": "El epílogo contiene caracteres no permitidos",
        }),
    link: Joi.string()
        .uri()
        .optional()
        .allow('')
        .messages({
            "string.uri": "El enlace debe ser una URL válida.",
            "any.unknown": "El campo 'link' no está permitido.",
        }),
    tipo: Joi.string()
        .valid("urgente", "avisos importantes", "otro")
        .optional()
        .allow("")
        .messages({
            "any.only": "El tipo de anuncio no es válido.",
        }),
    estado: Joi.boolean().optional(),
    imagen: Joi.string()
        .optional()
        .allow("")
        .messages({
            "string.base": "La imagen debe ser una URL válida.",
            "any.required": "La imagen es opcional.",
    }),
}).unknown(true);

export default { crearAnuncioValidation, modificarAnuncioValidation };  