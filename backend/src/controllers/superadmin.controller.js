"use strict";
import Usuario from "../entity/usuario.entity.js";
import Rol from "../entity/rol.entity.js";
import { AppDataSource } from "../config/configDb.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../handlers/responseHandlers.js";
import { Like, MoreThanOrEqual } from "typeorm";

 
export async function obtenerUsuarios(req, res) {
  // LOG INICIAL - Verificar que la función se ejecuta
  
  try {
    // Extraer parámetros con logging
    const { page = 1, limit = 10, rol: filtroRol, estado, search: busqueda } = req.query;
    const repositorioUsuario = AppDataSource.getRepository(Usuario);

    // Configurar opciones de consulta
    const opcionesConsulta = {
      relations: ["rol"],
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    };

    // Construir condiciones WHERE
    const condicionesWhere = {};

    if (filtroRol && filtroRol !== "all") {
      condicionesWhere.rol = { nombre: filtroRol };
    }

    if (estado && estado !== "all") {
      condicionesWhere.estado = estado;
    }


    // Lógica de búsqueda mejorada
    if (busqueda) {
      
      try {
        
        // Buscar por nombre
        const [usuariosPorNombre, totalPorNombre] = await repositorioUsuario.findAndCount({
          ...opcionesConsulta,
          where: {
            ...condicionesWhere,
            nombre: Like(`%${busqueda}%`)
          }
        });

        // Buscar por correo
        const [usuariosPorCorreo, totalPorCorreo] = await repositorioUsuario.findAndCount({
          ...opcionesConsulta,
          where: {
            ...condicionesWhere,
            correo: Like(`%${busqueda}%`)
          }
        });


        // Combinar y eliminar duplicados
        const usuariosUnicos = new Map();
        [...usuariosPorNombre, ...usuariosPorCorreo].forEach(usuario => {
          usuariosUnicos.set(usuario.id, usuario);
        });

        const usuarios = Array.from(usuariosUnicos.values()).slice(0, parseInt(limit));
        const total = Math.max(totalPorNombre, totalPorCorreo);


        // Remover contraseñas
        const usuariosSinContrasena = usuarios.map(usuario => {
          const { contrasena, ...usuarioSeguro } = usuario;
          return usuarioSeguro;
        });

        const datosRespuesta = {
          usuarios: usuariosSinContrasena,
          paginacion: {
            paginaActual: parseInt(page),
            totalPaginas: Math.ceil(total / limit),
            total,
            limite: parseInt(limit)
          }
        };

     

        return handleSuccess(res, 200, "Usuarios obtenidos exitosamente", datosRespuesta);

      } catch (errorBusqueda) {
        throw errorBusqueda;
      }
    }

    // Consulta normal sin búsqueda
    
    opcionesConsulta.where = condicionesWhere;

    const [usuarios, total] = await repositorioUsuario.findAndCount(opcionesConsulta);

    // Remover contraseñas
    const usuariosSinContrasena = usuarios.map(usuario => {
      const { contrasena, ...usuarioSeguro } = usuario;
      return usuarioSeguro;
    });

    const datosRespuesta = {
      usuarios: usuariosSinContrasena,
      paginacion: {
        paginaActual: parseInt(page),
        totalPaginas: Math.ceil(total / limit),
        total,
        limite: parseInt(limit)
      }
    };

 

    return handleSuccess(res, 200, "Usuarios obtenidos exitosamente", datosRespuesta);

  } catch (error) {
  
    
    return handleErrorServer(res, 500, `Error interno del servidor: ${error.message}`);
  }
}


export async function alternarRolUsuario(req, res) {
  try {
    const {usuarioid  } = req.params;
    const idUsuario = parseInt(usuarioid,10);
    

    

    const repositorioUsuario = AppDataSource.getRepository(Usuario);
    const repositorioRol = AppDataSource.getRepository(Rol);
    
    const usuario = await repositorioUsuario.findOne({
      where: { id: parseInt(idUsuario) },
      relations: ["rol"]
    });

    if (!usuario) {
      return handleErrorClient(res, 404, "Usuario no encontrado en el sistema");
    }

    if (usuario.rol?.isSuperAdmin) {
      return handleErrorClient(
        res, 
        403, 
        "Operación no permitida",
        "No se puede modificar el rol de un superadministrador"
      );
    }

    const rolAdmin = await repositorioRol.findOne({ 
      where: { nombre: "administrador" } 
    });
    const rolEstudiante = await repositorioRol.findOne({ 
      where: { nombre: "estudiante" } 
    });

    if (!rolAdmin || !rolEstudiante) {
      return handleErrorServer(res, 500, "Error de configuración: roles del sistema no encontrados");
    }

    const rolActual = usuario.rol?.nombre;
    let nuevoRol;
    let mensajeCambio;

    if (rolActual === "administrador") {
      nuevoRol = rolEstudiante;
      mensajeCambio = "administrador a estudiante";
    } else {
      nuevoRol = rolAdmin;
      mensajeCambio = "estudiante a administrador";
    }

    await repositorioUsuario.update(parseInt(idUsuario), {
      rol: nuevoRol,
      updatedAt: new Date()
    });

    const usuarioActualizado = await repositorioUsuario.findOne({
      where: { id: parseInt(idUsuario) },
      relations: ["rol"]
    });

    const { contrasena, ...usuarioRespuesta } = usuarioActualizado;

    const datosRespuesta = {
      usuario: usuarioRespuesta,
      cambio: {
        rolAnterior: rolActual,
        rolNuevo: nuevoRol.nombre,
        mensaje: `Rol cambiado exitosamente de ${mensajeCambio}`
      }
    };

    return handleSuccess(res, 200, `Rol cambiado de ${mensajeCambio}`, datosRespuesta);
  } catch (error) {
    console.error("Error al cambiar rol de usuario:", error);
    return handleErrorServer(res, 500, "Error interno del servidor al cambiar rol de usuario");
  }
}


export async function obtenerEstadisticasUsuarios(req, res) {
  try {
    const repositorioUsuario = AppDataSource.getRepository(Usuario);
    
    // Calcular fecha de hace 30 días para estadística de nuevos usuarios
    const fechaTreintaDias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Ejecutar todas las consultas de estadísticas en paralelo para optimizar rendimiento
    const [
      totalUsuarios,
      estudiantesActivos,
      administradoresActivos,
      usuariosInactivos,
      nuevosUsuariosTreintaDias
    ] = await Promise.all([
      // Contar total de usuarios en el sistema
      repositorioUsuario.count(),
      
      // Contar estudiantes activos
      repositorioUsuario.count({
        where: {
          rol: { nombre: "estudiante" },
          estado: "activo"
        },
        relations: ["rol"]
      }),
      
      // Contar administradores activos
      repositorioUsuario.count({
        where: {
          rol: { nombre: "administrador" },
          estado: "activo"
        },
        relations: ["rol"]
      }),
      
      // Contar usuarios inactivos
      repositorioUsuario.count({ 
        where: { estado: "inactivo" } 
      }),
      
      // Contar usuarios creados en los últimos 30 días
      repositorioUsuario.count({
        where: {
          createdAt: MoreThanOrEqual(fechaTreintaDias)
        }
      })
    ]);

    const estadisticas = {
      totalUsuarios,
      estudiantesActivos,
      administradoresActivos,
      usuariosInactivos,
      nuevosUsuariosTreintaDias,
      usuariosSuperAdmin: 1 // Valor fijo asumiendo al menos 1 superadmin
    };

    return handleSuccess(res, 200, "Estadísticas obtenidas exitosamente", estadisticas);
  } catch (error) {
    console.error("Error al obtener estadísticas de usuarios:", error);
    return handleErrorServer(res, 500, "Error interno del servidor al obtener estadísticas");
  }
}