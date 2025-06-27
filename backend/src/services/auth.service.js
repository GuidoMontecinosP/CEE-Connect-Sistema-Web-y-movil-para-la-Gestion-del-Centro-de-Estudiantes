"use strict";
import Usuario from "../entity/usuario.entity.js";
import Rol from "../entity/rol.entity.js";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/configDb.js";
import { comparePassword, encryptPassword } from "../helpers/bcrypt.helper.js";
import { ACCESS_TOKEN_SECRET } from "../config/configEnv.js";

export async function loginService(user) {
  try {
    const usuarioRepository = AppDataSource.getRepository(Usuario);
    const { correo, password } = user;

    const createErrorMessage = (dataInfo, message) => ({
      dataInfo,
      message
    });

    const userFound = await usuarioRepository.findOne({
      where: { correo },
      relations: ["rol"], // ✅ Incluye rol completo
    });

    if (!userFound) {
      return [null, createErrorMessage("correo", "El correo electrónico es incorrecto")];
    }

    const isMatch = await comparePassword(password, userFound.contrasena);
    if (!isMatch) {
      return [null, createErrorMessage("contrasena", "La contraseña es incorrecta")];
    }

    if (userFound.estado !== "activo") {
      return [null, createErrorMessage("estado", "La cuenta está desactivada")];
    }

    // ✅ Aquí incluimos el objeto "rol" en el payload
    const payload = {
      nombre: userFound.nombre,
      id: userFound.id,
      correo: userFound.correo,
      rol: {
        nombre: userFound.rol.nombre,
        isAdmin: userFound.rol.isAdmin,
      },
    };

    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: "1d",
    });

    const { contrasena, ...userWithoutPassword } = userFound;

    return [{ token: accessToken, user: userWithoutPassword }, null];
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return [null, "Error interno del servidor"];
  }
}


export async function registerService(user) {
  try {
    const usuarioRepository = AppDataSource.getRepository(Usuario);
    const rolRepository = AppDataSource.getRepository(Rol);

    const { nombre, correo, password, rolId, estado = "activo" } = user;

    const createErrorMessage = (dataInfo, message) => ({
      dataInfo,
      message
    });

    const existingUser = await usuarioRepository.findOne({ where: { correo } });
    if (existingUser) return [null, createErrorMessage("correo", "Correo en uso")];

    const rolFound = await rolRepository.findOneBy({ id: rolId });
    if (!rolFound) return [null, createErrorMessage("rolId", "Rol no válido")];

    const newUser = usuarioRepository.create({
      nombre,
      correo,
      contrasena: await encryptPassword(password),
      rol:rolFound,
      estado,
    });

    await usuarioRepository.save(newUser);

    const { contrasena: _, ...userData } = newUser;

    return [userData, null];
  } catch (error) {
    console.error("Error al registrar un usuario", error);
    return [null, "Error interno del servidor"];
  }
}
