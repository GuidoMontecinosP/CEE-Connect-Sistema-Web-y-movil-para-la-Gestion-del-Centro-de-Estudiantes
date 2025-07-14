"use strict";
import Usuario from "../entity/usuario.entity.js";
import Rol from "../entity/rol.entity.js";
import { AppDataSource } from "../config/configDb.js";
import { comparePassword, encryptPassword } from "../helpers/bcrypt.helper.js";

export async function getUserService(query) {
  try {
    const { id, correo } = query;
    const usuarioRepository = AppDataSource.getRepository(Usuario);

    const userFound = await usuarioRepository.findOne({
      where: [{ id }, { correo }],
    });

    if (!userFound) return [null, "Usuario no encontrado"];

    const { contrasena, ...userData } = userFound;
    return [userData, null];
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function getUsersService() {
  try {
    const usuarioRepository = AppDataSource.getRepository(Usuario);
    const users = await usuarioRepository.find();

    if (!users || users.length === 0) return [null, "No hay usuarios"];

    const usersData = users.map(({ contrasena, ...user }) => user);
    return [usersData, null];
  } catch (error) {
    console.error("Error al obtener a los usuarios:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function updateUserService(query, body, currentUserId) {
  try {
    const { id, correo } = query;
    const usuarioRepository = AppDataSource.getRepository(Usuario);
    const rolRepository = AppDataSource.getRepository(Rol);

    const userFound = await usuarioRepository.findOne({
      where: [{ id }, { correo }],
    });

    if (!userFound) return [null, "Usuario no encontrado"];
    
    if (body.correo) {
    const existingCorreo = await usuarioRepository.findOneBy({ correo: body.correo });
    if (existingCorreo && existingCorreo.id !== userFound.id) {
    return [null, "Ya existe un usuario con ese correo"];
    }
    }

    if (body.contrasena) {
      const matchPassword = await comparePassword(body.contrasena, userFound.contrasena);
      if (!matchPassword) return [null, "La contraseña no coincide"];
    }

    // Validar protección para no cambiar rol de otro admin sin ser él mismo
    const rolActual = await rolRepository.findOneBy({ id: userFound.rolId });
    const nuevoRol = await rolRepository.findOneBy({ id: body.rolId });

    if (
      rolActual?.isAdmin &&
      userFound.id !== currentUserId &&
      nuevoRol?.id !== rolActual?.id
    ) {
      return [null, "No puedes cambiar el rol de otro administrador sin confirmación adicional"];
    }

    const dataUserUpdate = {
      nombre: body.nombre,
      correo: body.correo,
      rolId: body.rolId,
      estado: body.estado || userFound.estado,
      updatedAt: new Date(),
    };

    if (body.correo) dataUserUpdate.correo = body.correo;

    if (body.nuevaContrasena && body.nuevaContrasena.trim() !== "") {
      dataUserUpdate.contrasena = await encryptPassword(body.nuevaContrasena);
    }

    await usuarioRepository.update({ id: userFound.id }, dataUserUpdate);

    const userData = await usuarioRepository.findOne({ where: { id: userFound.id } });
    if (!userData) return [null, "Usuario no encontrado después de actualizar"];

    const { contrasena, ...userUpdated } = userData;
    return [userUpdated, null];
  } catch (error) {
    console.error("Error al modificar un usuario:", error);
    return [null, "Error interno del servidor"];
  }
}

export async function deleteUserService(query) {
  try {
    const { id, correo } = query;
    const usuarioRepository = AppDataSource.getRepository(Usuario);
    const rolRepository = AppDataSource.getRepository(Rol);

    const userFound = await usuarioRepository.findOne({
      where: [{ id }, { correo }],
    });

    if (!userFound) return [null, "Usuario no encontrado"];

    const rol = await rolRepository.findOneBy({ id: userFound.rolId });

    if (rol?.isAdmin) {
      return [null, "No se puede eliminar un usuario con rol de administrador"];
    }

    const userDeleted = await usuarioRepository.remove(userFound);
    const { contrasena, ...dataUser } = userDeleted;

    return [dataUser, null];
  } catch (error) {
    console.error("Error al eliminar un usuario:", error);
    return [null, "Error interno del servidor"];
  }
}
