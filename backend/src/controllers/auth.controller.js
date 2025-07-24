
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
import bcrypt from "bcryptjs";

// Configuración de transporte para envío de correos
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generar token de verificación
function generarTokenVerificacion(usuario) {
  return jwt.sign(
    { id: usuario.id, correo: usuario.correo },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

function generarTokenRecuperacion(usuario) {
  return jwt.sign(
    { id: usuario.id, correo: usuario.correo, tipo: "recuperacion" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" } // Token más corto para seguridad
  );
}
//  VERIFICAR CORREO
export const verificarCorreo = async (req, res) => {
    const { token } = req.params;
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const repo = AppDataSource.getRepository("Usuario");
        
        const usuario = await repo.findOneBy({ id: decoded.id });
        
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        
        // Verificar si ya estaba verificado
        if (usuario.verificado) {
            return res.status(200).json({
                message: "Cuenta ya verificada anteriormente.",
                verificado: true,
                already_verified: true  // Agregar esta bandera
            });
        }
        
        // Si no estaba verificado, verificar ahora
        usuario.verificado = true;
        await repo.save(usuario);
        
        res.status(200).json({
            message: "Cuenta verificada con éxito.",
            verificado: true,
            already_verified: false  // Agregar esta bandera
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(400).json({ message: "Token inválido o expirado." });
    }
};

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
    const urlVerificacion = `http://localhost:5173/verificar/${tokenVerificacion}`; //cambiar por url de producción 1712

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

export async function logout(req, res) {
  try {
    res.clearCookie("jwt", { httpOnly: true });
    handleSuccess(res, 200, "Sesión cerrada exitosamente");
  } catch (error) {
    console.error("Error en logout:", error);
    handleErrorServer(res, 500, "Error interno del servidor");
  }
}

export async function recuperarContrasena(req, res) {
  try {
    const { correo } = req.body;
    if (!correo) {
      return handleErrorClient(res, 400, "Correo es requerido");
    }

    const repo = AppDataSource.getRepository("Usuario");
    const usuario = await repo.findOneBy({ correo });

    if (!usuario) {
      return handleErrorClient(res, 404, "Usuario no encontrado");
    }

    // Generar token de recuperación
    const tokenRecuperacion = generarTokenRecuperacion(usuario);
    const urlRecuperacion = `http://localhost:5173/reset-password/${tokenRecuperacion}`; // Cambiar por la URL de producción

    // Enviar correo con el enlace de recuperación
    await transporter.sendMail({
      from: '"CEE Connect" <no-reply@ceeconnect.cl>',
      to: usuario.correo,
      subject: "Recuperación de contraseña - CEE Connect",
      html: `
        <h3>Recuperación de contraseña</h3>
        <p>Hola ${usuario.nombre},</p>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
        <a href="${urlRecuperacion}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer contraseña</a>
        <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
        <p>${urlRecuperacion}</p>
        <p><strong>Este enlace expira en 1 hora.</strong></p>
        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        <hr>
        <p><small>CEE Connect - Sistema de gestión de CEE de la Universidad del Bío-Bío</small></p>
      `,
    });

    handleSuccess(res, 200, "Correo de recuperación enviado exitosamente");
  } catch (error) {
    console.error("Error al recuperar contraseña:", error);
    handleErrorServer(res, 500, "Error interno del servidor");
  }
}

export async function restablecerContrasena(req, res) {
  try {
    const { token } = req.params;
    const { nuevaContrasena } = req.body;

    if (!nuevaContrasena) {
      return handleErrorClient(res, 400, "Nueva contraseña es requerida");
    }

    if (nuevaContrasena.length < 6) {
      return handleErrorClient(res, 400, "La contraseña debe tener al menos 6 caracteres");
    }

    // Verificar el token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return handleErrorClient(res, 400, "Token inválido o expirado");
    }

    // Verificar que sea un token de recuperación
    if (decoded.tipo !== "recuperacion") {
      return handleErrorClient(res, 400, "Token inválido");
    }

    const repo = AppDataSource.getRepository("Usuario");
    const usuario = await repo.findOneBy({ id: decoded.id });

    if (!usuario) {
      return handleErrorClient(res, 404, "Usuario no encontrado");
    }

    // Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nuevaContrasena, salt);

    // Actualizar la contraseña
    usuario.contrasena = hashedPassword;
    await repo.save(usuario);

    handleSuccess(res, 200, "Contraseña actualizada exitosamente");
  } catch (error) {
    console.error("Error al restablecer contraseña:", error);
    handleErrorServer(res, 500, "Error interno del servidor");
  }
}

export async function verificarTokenRecuperacion(req, res) {
  try {
    const { token } = req.params;

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return handleErrorClient(res, 400, "Token inválido o expirado");
    }

    if (decoded.tipo !== "recuperacion") {
      return handleErrorClient(res, 400, "Token inválido");
    }

    const repo = AppDataSource.getRepository("Usuario");
    const usuario = await repo.findOneBy({ id: decoded.id });

    if (!usuario) {
      return handleErrorClient(res, 404, "Usuario no encontrado");
    }

    handleSuccess(res, 200, "Token válido", { correo: usuario.correo });
  } catch (error) {
    console.error("Error al verificar token:", error);
    handleErrorServer(res, 500, "Error interno del servidor");
  }
}