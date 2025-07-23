"use strict";


export function handleSuccess(res, statusCode = 200, message = "Operación exitosa", data = {}) {
  return res.status(statusCode).json({
    ok: true,
    status: "success",
    message,
    data,
  });
}


export function handleErrorClient(res, statusCode, message, details) {
  return res.status(statusCode).json({
    state: "Error",
    message,
    details: details || message, 
    statusCode
  });
}


export function handleErrorServer(res, statusCode = 500, message = "Error interno del servidor") {
  return res.status(statusCode).json({
    ok: false,
    status: "server_error",
    message,
  });
}
