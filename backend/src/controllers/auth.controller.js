"use strict";
import { loginService, registerService } from "../services/auth.service.js";
import {
  authValidation,
  registerValidation,
} from "../validations/auth.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

export async function login(req, res) {
  try {
    const { body } = req;

    const { error } = authValidation.validate(body);
    if (error) {
      return handleErrorClient(res, 400, "Error de validación", error.message);
    }

    const [result, errorToken] = await loginService(body);

    if (errorToken) {
      return handleErrorClient(res, 400, "Error iniciando sesión", errorToken);
    }

    const { token, user } = result;

    // ✅ Guardar el token como cookie httpOnly (opcional)
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 día
      secure: process.env.NODE_ENV === "production", // Solo en HTTPS en producción
      sameSite: "Strict",
    });

    // ✅ Responder con el token y los datos del usuario
    handleSuccess(res, 200, "Inicio de sesión exitoso", {
      token,
      user,
    });
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function register(req, res) {
  try {
    const { body } = req;

    const { error } = registerValidation.validate(body);

    if (error)
      return handleErrorClient(res, 400, "Error de validación", error.message);

    const [newUser, errorNewUser] = await registerService(body);

    if (errorNewUser) return handleErrorClient(res, 400, "Error registrando al usuario", errorNewUser);

    handleSuccess(res, 201, "Usuario registrado con éxito", newUser);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function logout(req, res) {
  try {
    res.clearCookie("jwt", { httpOnly: true });
    handleSuccess(res, 200, "Sesión cerrada exitosamente");
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}