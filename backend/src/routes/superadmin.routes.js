"use strict";
import { Router } from "express";
import { isSuperAdmin } from "../middlewares/superadmin.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  obtenerUsuarios,
  alternarRolUsuario,
  obtenerEstadisticasUsuarios,
} from "../controllers/superadmin.controller.js";

const router = Router();


// Aplicar middlewares: JWT + SuperAdmin
router.use(authenticateJwt);
router.use(isSuperAdmin);

// Rutas del superadmin
router.get("/usuarios", obtenerUsuarios);
router.patch("/usuarios/:usuarioid/cambiar", alternarRolUsuario);
router.get("/estadisticas", obtenerEstadisticasUsuarios);

export default router;


