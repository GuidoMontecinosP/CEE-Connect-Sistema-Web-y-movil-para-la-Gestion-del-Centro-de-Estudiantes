// backend/src/validations/sugerencias.validation.js
"use strict";

import { body, param, query } from "express-validator";
import { handleValidationErrors } from "../helpers/validation.helper.js";

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

export const validarCrearSugerencia = [
  body("titulo")
    .notEmpty()
    .withMessage("El título es obligatorio")
    .isLength({ min: 5, max: 200 })
    .withMessage("El título debe tener entre 5 y 200 caracteres")
    .trim(),
  
  body("mensaje")
    .notEmpty()
    .withMessage("El mensaje es obligatorio")
    .isLength({ min: 10, max: 2000 })
    .withMessage("El mensaje debe tener entre 10 y 2000 caracteres")
    .trim(),
  
  body("categoria")
    .notEmpty()
    .withMessage("La categoría es obligatoria")
    .isIn(CATEGORIAS_VALIDAS)
    .withMessage(`La categoría debe ser una de: ${CATEGORIAS_VALIDAS.join(", ")}`),
  
  body("contacto")
    .optional()
    .isLength({ max: 100 })
    .withMessage("El contacto no puede exceder los 100 caracteres")
    .trim(),

  handleValidationErrors
];

export const validarActualizarSugerencia = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID debe ser un número entero positivo"),
  
  body("titulo")
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage("El título debe tener entre 5 y 200 caracteres")
    .trim(),
  
  body("mensaje")
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage("El mensaje debe tener entre 10 y 2000 caracteres")
    .trim(),
  
  body("categoria")
    .optional()
    .isIn(CATEGORIAS_VALIDAS)
    .withMessage(`La categoría debe ser una de: ${CATEGORIAS_VALIDAS.join(", ")}`),
  
  body("contacto")
    .optional()
    .isLength({ max: 100 })
    .withMessage("El contacto no puede exceder los 100 caracteres")
    .trim(),

  handleValidationErrors
];

export const validarResponderSugerencia = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID debe ser un número entero positivo"),
  
  body("respuesta")
    .notEmpty()
    .withMessage("La respuesta es obligatoria")
    .isLength({ min: 10, max: 1000 })
    .withMessage("La respuesta debe tener entre 10 y 1000 caracteres")
    .trim(),
  
  body("estado")
    .optional()
    .isIn(ESTADOS_VALIDOS)
    .withMessage(`El estado debe ser uno de: ${ESTADOS_VALIDOS.join(", ")}`),

  handleValidationErrors
];

export const validarIdSugerencia = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID debe ser un número entero positivo"),
  
  handleValidationErrors
];

export const validarPaginacion = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("La página debe ser un número entero positivo"),
  
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("El límite debe ser un número entre 1 y 100"),
  
  query("categoria")
    .optional()
    .isIn(CATEGORIAS_VALIDAS)
    .withMessage(`La categoría debe ser una de: ${CATEGORIAS_VALIDAS.join(", ")}`),
  
  query("estado")
    .optional()
    .isIn(ESTADOS_VALIDOS)
    .withMessage(`El estado debe ser uno de: ${ESTADOS_VALIDOS.join(", ")}`),

  handleValidationErrors
];

// Validación específica para filtros de administrador
export const validarFiltrosAdmin = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("La página debe ser un número entero positivo"),
  
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("El límite debe ser un número entre 1 y 100"),
  
  query("isReportada")
    .optional()
    .isBoolean()
    .withMessage("isReportada debe ser true o false"),
  
  query("minReportes")
    .optional()
    .isInt({ min: 0 })
    .withMessage("minReportes debe ser un número entero positivo o cero"),

  handleValidationErrors
];

export { CATEGORIAS_VALIDAS, ESTADOS_VALIDOS };