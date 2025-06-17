"use strict";
import bcrypt from "bcryptjs";

/**
 * Hashea una contraseña utilizando bcrypt y una sal de 10 rondas.
 * @param {string} plainPassword - La contraseña sin encriptar.
 * @returns {Promise<string>} - Contraseña encriptada.
 */
export async function encryptPassword(plainPassword) {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(plainPassword, salt);
}

/**
 * Compara una contraseña proporcionada con el hash almacenado.
 * @param {string} plainPassword - Contraseña ingresada por el usuario.
 * @param {string} hashedPassword - Contraseña encriptada desde la base de datos.
 * @returns {Promise<boolean>} - True si coinciden, false si no.
 */
export async function comparePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}
