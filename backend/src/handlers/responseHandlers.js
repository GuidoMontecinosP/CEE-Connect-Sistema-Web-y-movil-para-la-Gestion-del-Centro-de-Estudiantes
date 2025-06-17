"use strict";

/**
 * Envía una respuesta exitosa (2xx)
 * @param {object} res - Objeto de respuesta de Express
 * @param {number} statusCode - Código HTTP (default: 200)
 * @param {string} message - Mensaje de éxito
 * @param {object} data - Información adicional
 */
export function handleSuccess(res, statusCode = 200, message = "Operación exitosa", data = {}) {
  return res.status(statusCode).json({
    ok: true,
    status: "success",
    message,
    data,
  });
}

/**
 * Envía una respuesta de error del cliente (4xx)
 * @param {object} res - Objeto de respuesta de Express
 * @param {number} statusCode - Código HTTP (default: 400)
 * @param {string} message - Mensaje de error
 * @param {object} details - Detalles adicionales del error
 */
export function handleErrorClient(res, statusCode = 400, message = "Error del cliente", details = {}) {
  return res.status(statusCode).json({
    ok: false,
    status: "client_error",
    message,
    details,
  });
}

/**
 * Envía una respuesta de error del servidor (5xx)
 * @param {object} res - Objeto de respuesta de Express
 * @param {number} statusCode - Código HTTP (default: 500)
 * @param {string} message - Mensaje de error del servidor
 */
export function handleErrorServer(res, statusCode = 500, message = "Error interno del servidor") {
  return res.status(statusCode).json({
    ok: false,
    status: "server_error",
    message,
  });
}
