"use strict";
import Joi from "joi";

export const crearEventoValidation = Joi.object({
    titulo: Joi.string()
        .min(10)
        .max(300)
        .trim()
        .pattern(/^(?!.*\s{2})(?!\s)(?!.*\s$)[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\d.,;:¿?¡!()-]+$/)
        .required()
        .messages({
            "string.empty": "El título del evento no puede estar vacío.",
            "string.base": "El título debe ser un texto.",
            "string.min": "El título debe tener al menos 10 caracteres.",
            "string.max": "El título no puede exceder los 300 caracteres.",
            "string.pattern.base": "El título contiene caracteres no permitidos",
            "any.required": "El título es obligatorio.",
        }),

    descripcion: Joi.string()
        .min(10)
        .max(1000)
        .trim()
        .pattern(/^(?!.*\s{2})(?!\s)(?!.*\s$)[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\d.,;:¿?¡!()-]+$/)
        .required()
        .messages({
            "string.empty": "La descripción del evento no puede estar vacía.",
            "string.base": "La descripción debe ser un texto.",
            "string.min": "La descripción debe tener al menos 10 caracteres.",
            "string.max": "La descripción no puede exceder los 1000 caracteres.",
            "string.pattern.base": "La descripción contiene caracteres no permitidos",
            "any.required": "La descripción es obligatoria.",
        }),

    fecha: Joi.string()
        // .greater("now")
        .custom((value, helpers) => {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            // Evita interpretación UTC: usamos el string directamente
            const [anio, mes, dia] = value.split("-").map(Number);
            const fechaEvento = new Date(anio, mes - 1, dia); // Mes 0-indexado
            fechaEvento.setHours(0, 0, 0, 0);

            if (fechaEvento < hoy) {
            return helpers.message("La fecha del evento debe ser hoy o una fecha futura.");
            }

            return value;
        })
        .required()
        .messages({
            "date.base": "La fecha del evento debe ser una fecha válida.",
            "any.required": "La fecha es obligatoria.",
        }),
    
    hora: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .required()
        .custom((value, helpers) => {
            const { fecha } = helpers.state.ancestors[0];
            if (!fecha) return value;

            const fechaHora = new Date(`${fecha}T${value}`);

            const ahora = new Date();

            if (fechaHora < ahora) {
                return helpers.message(" La hora tiene que ser posterior a la hora actual.");
            }
            return value;
        })
        .messages({
            "string.empty": "La hora del evento no puede estar vacía.",
            "string.pattern.base": "La hora debe tener el formato HH:MM (24 horas).",
            "any.required": "La hora es obligatoria.",
        }),

    lugar: Joi.string()
        .min(3)
        .max(300)
        .trim()
        .pattern(/^(?!.*\s{2})(?!\s)(?!.*\s$)[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\d.,;:¿?¡!()-]+$/)
        .required()
        .messages({
            "string.empty": "El lugar del evento no puede estar vacío.",
            "string.min": "El lugar debe tener al menos 3 caracteres.",
            "string.max": "El lugar no puede exceder los 300 caracteres.",
            "string.pattern.base": "El lugar contiene caracteres no permitidos",
            "any.required": "El lugar es obligatorio.",
        }),

    tipo: Joi.string()
        .valid("Reunión", "Taller", "Charla", "Recreativo", "otro", "Conferencia")
        .required()
        .messages({
            "any.only": "El tipo de evento no es válido.",
            "any.required": "El tipo es obligatorio.",
        }),
});

export const modificarEventoValidation = Joi.object({
        titulo: Joi.string()
        .min(10)
        .max(300)
        .trim()
        .pattern(/^(?!.*\s{2})(?!\s)(?!.*\s$)[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\d.,;:¿?¡!()-]+$/)
        .optional()
        .allow("")
        .messages({
            "string.base": "El título debe ser un texto.",
            "string.min": "El título debe tener al menos 10 caracteres.",
            "string.max": "El título no puede exceder los 300 caracteres.",
            "string.pattern.base": "El título contiene caracteres no permitidos",
            "any.required": "El título es obligatorio.",
        }),

    descripcion: Joi.string()
        .min(10)
        .max(1000)
        .trim()
        .pattern(/^(?!.*\s{2})(?!\s)(?!.*\s$)[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\d.,;:¿?¡!()-]+$/)
        .optional()
        .allow("")
        .messages({
            "string.base": "La descripción debe ser un texto.",
            "string.min": "La descripción debe tener al menos 10 caracteres.",
            "string.max": "La descripción no puede exceder los 1000 caracteres.",
            "string.pattern.base": "La descripción contiene caracteres no permitidos",
            "any.required": "La descripción es obligatoria.",
        }),

    fecha: Joi.string()
        .custom((value, helpers) => {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            // Evita interpretación UTC: usamos el string directamente
            const [anio, mes, dia] = value.split("-").map(Number);
            const fechaEvento = new Date(anio, mes - 1, dia); // Mes 0-indexado
            fechaEvento.setHours(0, 0, 0, 0);

            if (fechaEvento < hoy) {
            return helpers.message("La fecha del evento debe ser hoy o una fecha futura.");
            }

            return value;
        })
        .optional()
        .allow("")
        .messages({
            "date.base": "La fecha del evento debe ser una fecha válida.",
            "any.required": "La fecha es obligatoria.",
        }),
    
    hora: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .custom((value, helpers) => {
            const { fecha } = helpers.state.ancestors[0];
            if (!fecha) return value;

            const fechaHora = new Date(`${fecha}T${value}`);

            const ahora = new Date();

            if (fechaHora < ahora) {
                return helpers.message(" La hora tiene que ser posterior a la hora actual.");
            }
            return value;
        })
        .optional()
        .allow("")
        .messages({
            "string.empty": "La hora del evento no puede estar vacía.",
            "string.pattern.base": "La hora debe tener el formato HH:MM (24 horas).",
            "any.required": "La hora es obligatoria.",
        }),

    lugar: Joi.string()
        .min(3)
        .max(300)
        .trim()
        .pattern(/^(?!.*\s{2})(?!\s)(?!.*\s$)[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\d.,;:¿?¡!()-]+$/)
        .optional()
        .allow("")
        .messages({
            "string.empty": "El lugar del evento no puede estar vacío.",
            "string.min": "El lugar debe tener al menos 3 caracteres.",
            "string.max": "El lugar no puede exceder los 300 caracteres.",
            "string.pattern.base": "El lugar contiene caracteres no permitidos",
            "any.required": "El lugar es obligatorio.",
        }),

    tipo: Joi.string()
        .valid("Reunión", "Taller", "Charla", "Recreativo", "Otro", "Conferencia")
        .optional()
        .allow("")
        .messages({
            "any.only": "El tipo de evento no es válido.",
            "any.required": "El tipo es obligatorio.",
        }),
});

export default {crearEventoValidation, modificarEventoValidation};