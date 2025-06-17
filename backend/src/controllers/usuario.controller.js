"use strict";
import {
  deleteUserService,
  getUserService,
  getUsersService,
  updateUserService,
} from "../services/usuario.service.js"; // usa el nuevo nombre del service
import {
  userBodyValidation,
  userQueryValidation,
} from "../validations/usuario.validation.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

export async function getUser(req, res) {
  try {
    const { id, correo } = req.query;

    const { error } = userQueryValidation.validate({ id, correo });

    if (error) return handleErrorClient(res, 400, error.message);

    const [user, errorUser] = await getUserService({ id, correo });

    if (errorUser) return handleErrorClient(res, 404, errorUser);

    handleSuccess(res, 200, "Usuario encontrado", user);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getUsers(req, res) {
  try {
    const [users, errorUsers] = await getUsersService();

    if (errorUsers) return handleErrorClient(res, 404, errorUsers);

    users.length === 0
      ? handleSuccess(res, 204)
      : handleSuccess(res, 200, "Usuarios encontrados", users);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateUser(req, res) {
  try {
    const { id, correo } = req.query;
    const { body } = req;

    const { error: queryError } = userQueryValidation.validate({ id, correo });
    if (queryError) {
      return handleErrorClient(
        res,
        400,
        "Error de validación en la consulta",
        queryError.message,
      );
    }

    const { error: bodyError } = userBodyValidation.validate(body);
    if (bodyError) {
      return handleErrorClient(
        res,
        400,
        "Error de validación en los datos enviados",
        bodyError.message,
      );
    }

    const currentUserId = req.user.id; // ← recuperado del token JWT
    const [user, userError] = await updateUserService({ id, correo }, body, currentUserId);

    if (userError) return handleErrorClient(res, 400, "Error modificando al usuario", userError);

    handleSuccess(res, 200, "Usuario modificado correctamente", user);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteUser(req, res) {
  try {
    const { id, correo } = req.query;

    const { error: queryError } = userQueryValidation.validate({ id, correo });
    if (queryError) {
      return handleErrorClient(
        res,
        400,
        "Error de validación en la consulta",
        queryError.message,
      );
    }

    const [userDelete, errorUserDelete] = await deleteUserService({ id, correo });

    if (errorUserDelete) return handleErrorClient(res, 404, "Error eliminando al usuario", errorUserDelete);

    handleSuccess(res, 200, "Usuario eliminado correctamente", userDelete);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
