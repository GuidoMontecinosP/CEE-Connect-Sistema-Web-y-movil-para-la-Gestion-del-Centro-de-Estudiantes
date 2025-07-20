"use strict";
import {
    handleErrorClient,
    handleErrorServer,
} from "../handlers/responseHandlers.js";

export async function isSuperAdmin(req, res, next) {
    try {
        const rol = req.user?.rol;
        console.log("Verificado superadmin - Rol del usuario:", rol);

        if(!rol || !rol.isSuperAdmin) {
            return handleErrorClient(
                res,
                403,
                "Acceso denegado",
                "Se requiere un rol de superadministrador para realizar esta acción."
            );
        }

        next();
    } catch (error) {
        console.error("Error en isSuperAdmin:", error);
        handleErrorServer(res,"Error interno al verificar rol de superadmin")
    }
    }
