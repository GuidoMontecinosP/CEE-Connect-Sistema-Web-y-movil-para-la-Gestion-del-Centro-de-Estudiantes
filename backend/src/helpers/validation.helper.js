// backend/src/helpers/validation.helper.js
"use strict";

import { validationResult } from "express-validator";
import { handleErrorClient } from "../handlers/responseHandlers.js";

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return handleErrorClient(
      res, 
      400, 
      "Errores de validación",
      { errors: errorMessages }
    );
  }
  
  next();
};