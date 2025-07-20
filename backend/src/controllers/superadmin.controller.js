"use strict";
import Usuario from "../entity/usuario.entity.js";
import Rol from "../entity/rol.entity.js";
import { AppDataSource } from "../config/configDb.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";

/**
 * @name getAllUsers
 * @description Obtiene todos los usuarios con paginación y filtros
 */
export async function getAllUsers(req, res) {
  try {
    const { page = 1, limit = 10, rol: rolFiltro, estado, search } = req.query;
    
    const usuarioRepository = AppDataSource.getRepository(Usuario);
    const queryBuilder = usuarioRepository
      .createQueryBuilder("usuario")
      .leftJoinAndSelect("usuario.rol", "rol")
      .orderBy("usuario.createdAt", "DESC");

    // Aplicar filtros
    if (rolFiltro && rolFiltro !== "all") {
      queryBuilder.andWhere("rol.nombre = :rolFiltro", { rolFiltro });
    }
    
    if (estado && estado !== "all") {
      queryBuilder.andWhere("usuario.estado = :estado", { estado });
    }
    
    if (search) {
      queryBuilder.andWhere(
        "(usuario.nombre ILIKE :search OR usuario.correo ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    // Paginación
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [usuarios, total] = await queryBuilder.getManyAndCount();

    // Remover contraseñas de la respuesta
    const usuariosSinContrasena = usuarios.map(usuario => {
      const { contrasena, ...usuarioSinPassword } = usuario;
      return usuarioSinPassword;
    });

    const responseData = {
      usuarios: usuariosSinContrasena,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    };

    return handleSuccess(res, 200, "Usuarios obtenidos exitosamente", responseData);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return handleErrorServer(res, 500, "Error interno al obtener usuarios");
  }
}

/**
 * @name toggleUserRole
 * @description Alterna el rol entre estudiante y admin
 */
export async function toggleUserRole(req, res) {
  try {
    const { userId } = req.params;
    
    if (!userId || isNaN(userId)) {
      return handleErrorClient(res, 400, "ID de usuario inválido");
    }

    const usuarioRepository = AppDataSource.getRepository(Usuario);
    const rolRepository = AppDataSource.getRepository(Rol);
    
    // Buscar el usuario
    const usuario = await usuarioRepository.findOne({
      where: { id: parseInt(userId) },
      relations: ["rol"]
    });

    if (!usuario) {
      return handleErrorClient(res, 404, "Usuario no encontrado");
    }

    // Verificar que no sea superadmin
    if (usuario.rol?.isSuperAdmin) {
      return handleErrorClient(
        res, 
        403, 
        "Operación no permitida",
        "No se puede cambiar el rol de un superadministrador"
      );
    }

    // Obtener roles disponibles
    const rolAdmin = await rolRepository.findOne({ 
      where: { nombre: "admin" } 
    });
    const rolEstudiante = await rolRepository.findOne({ 
      where: { nombre: "estudiante" } 
    });

    if (!rolAdmin || !rolEstudiante) {
      return handleErrorServer(res, 500, "Error al obtener roles del sistema");
    }

    // Determinar el nuevo rol
    const rolActual = usuario.rol?.nombre;
    let nuevoRol;
    let mensajeRol;

    if (rolActual === "admin") {
      nuevoRol = rolEstudiante;
      mensajeRol = "admin a estudiante";
    } else {
      nuevoRol = rolAdmin;
      mensajeRol = "estudiante a admin";
    }

    // Actualizar el usuario
    usuario.rol = nuevoRol;
    usuario.updatedAt = new Date();
    
    await usuarioRepository.save(usuario);

    // Obtener usuario actualizado para la respuesta
    const usuarioActualizado = await usuarioRepository.findOne({
      where: { id: parseInt(userId) },
      relations: ["rol"]
    });

    const { contrasena, ...usuarioResponse } = usuarioActualizado;

    const responseData = {
      usuario: usuarioResponse,
      cambio: {
        rolAnterior: rolActual,
        rolNuevo: nuevoRol.nombre,
        mensaje: `Rol cambiado exitosamente de ${mensajeRol}`
      }
    };

    return handleSuccess(res, 200, `Rol cambiado de ${mensajeRol}`, responseData);
  } catch (error) {
    console.error("Error al cambiar rol:", error);
    return handleErrorServer(res, 500, "Error interno al cambiar rol de usuario");
  }
}

/**
 * @name getUserStats
 * @description Obtiene estadísticas del sistema
 */
export async function getUserStats(req, res) {
  try {
    const usuarioRepository = AppDataSource.getRepository(Usuario);
    
    const [
      totalUsuarios,
      estudiantesActivos,
      adminsActivos,
      usuariosInactivos,
      nuevosUsuarios30Dias
    ] = await Promise.all([
      usuarioRepository.count(),
      usuarioRepository
        .createQueryBuilder("usuario")
        .leftJoin("usuario.rol", "rol")
        .where("rol.nombre = :rol", { rol: "estudiante" })
        .andWhere("usuario.estado = :estado", { estado: "activo" })
        .getCount(),
      usuarioRepository
        .createQueryBuilder("usuario")
        .leftJoin("usuario.rol", "rol")
        .where("rol.nombre = :rol", { rol: "admin" })
        .andWhere("usuario.estado = :estado", { estado: "activo" })
        .getCount(),
      usuarioRepository.count({ where: { estado: "inactivo" } }),
      usuarioRepository
        .createQueryBuilder("usuario")
        .where("usuario.createdAt >= :fecha", { 
          fecha: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
        })
        .getCount()
    ]);

    const stats = {
      totalUsuarios,
      estudiantesActivos,
      adminsActivos,
      usuariosInactivos,
      nuevosUsuarios30Dias,
      usuariosSuperAdmin: 1 // Asumiendo que hay al menos 1 superadmin
    };

    return handleSuccess(res, 200, "Estadísticas obtenidas exitosamente", stats);
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return handleErrorServer(res, 500, "Error interno al obtener estadísticas");
  }
}