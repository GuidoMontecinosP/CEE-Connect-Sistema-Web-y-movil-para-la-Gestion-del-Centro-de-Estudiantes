
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
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/configDb.js";

// 💌 Configuración de transporte para envío de correos
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🔐 Generar token de verificación
function generarTokenVerificacion(usuario) {
  return jwt.sign(
    { id: usuario.id, correo: usuario.correo },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

// 📩 VERIFICAR CORREO
export const verificarCorreo = async (req, res) => {
  const { token } = req.params;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const repo = AppDataSource.getRepository("Usuario");

    const usuario = await repo.findOneBy({ id: decoded.id });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    if (usuario.verificado) {
      return res.status(400).json({ message: "Ya está verificado" });
    }

    usuario.verificado = true;
    await repo.save(usuario);

    res.status(200).json({ message: "Cuenta verificada con éxito." });
  } catch (err) {
    console.error("Error:", err);
    res.status(400).json({ message: "Token inválido o expirado." });
  }
};

// 🔐 LOGIN
export async function login(req, res) {
  try {
    const { body } = req;

    const { error } = authValidation.validate(body);
    if (error) {
      return handleErrorClient(res, 400, "Error de validación.", error.message);
    }

    const [result, errorToken] = await loginService(body);

    if (errorToken) {
      if (errorToken.dataInfo === "verificado") {
        return handleErrorClient(
          res,
          400,
          "Debes verificar tu correo institucional antes de iniciar sesión.",
          errorToken.message
        );
      }
      return handleErrorClient(res, 400, "Error iniciando sesión", errorToken.message || errorToken);
    }

    const { token, user } = result;

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    handleSuccess(res, 200, "Inicio de sesión exitoso", { token, user });
  } catch (error) {
    console.error("Error en el login:", error);
    handleErrorServer(res, 500, "Error interno del servidor");
  }
}


export async function register(req, res) {
  try {
    const { body } = req;
    const { error } = registerValidation.validate(body);

    if (error) {
      return handleErrorClient(res, 400, "Error de validación", error.message);
    }

    
    const repo = AppDataSource.getRepository("Usuario");
    const usuarioExistente = await repo.findOneBy({ correo: body.correo });
    if (usuarioExistente) {
      return handleErrorClient(res, 400, "Correo ya registrado");
    }

    // ✅ DESPUÉS crear el usuario (solo si no existe)
    const [usuarioCreado, errorNewUser] = await registerService(body);

    if (errorNewUser) {
      return handleErrorClient(res, 400, "Error registrando al usuario", errorNewUser);
    }

    // 📨 Generar token y enviar correo
    const tokenVerificacion = generarTokenVerificacion(usuarioCreado);
    const urlVerificacion = `http://192.168.1.10:3000/api/auth/verificar/${tokenVerificacion}`; //cambiar por url de producción 1712

    await transporter.sendMail({
      from: '"CEE Connect" <no-reply@ceeconnect.cl>',
      to: usuarioCreado.correo,
      subject: "Verifica tu cuenta institucional",
      html: `
        <h3>Bienvenido a CEE Connect</h3>
        <p>Haz clic en el siguiente enlace para verificar tu cuenta:</p>
        <a href="${urlVerificacion}">${urlVerificacion}</a>
        <p>Este enlace expira en 24 horas.</p>
      `,
    });

    handleSuccess(res, 201, "Usuario registrado con éxito. Verifica tu correo.", usuarioCreado);
  } catch (error) {
    console.error("Error al registrar un usuario:", error);
    handleErrorServer(res, 500, "Error interno del servidor");
  }
}


// 🔓 LOGOUT
export async function logout(req, res) {
  try {
    res.clearCookie("jwt", { httpOnly: true });
    handleSuccess(res, 200, "Sesión cerrada exitosamente");
  } catch (error) {
    console.error("Error en logout:", error);
    handleErrorServer(res, 500, "Error interno del servidor");
  }
}