//src/routes/reporte.routes.js

import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { crearReporte, obtenerReportes, eliminarReporte, vaciarReportes,obtenerMisReportes } from "../controllers/reporte.controller.js";

const router = Router();

router.post("/", authenticateJwt, crearReporte); // Cualquier usuario

router.get("/", authenticateJwt, isAdmin, obtenerReportes); // Solo admin
router.delete("/:id", authenticateJwt, isAdmin, eliminarReporte); // Solo admin
router.delete("/sugerencia/:sugerenciaId/vaciar", authenticateJwt, isAdmin, vaciarReportes); // Solo admin
router.get("/mis-reportes", authenticateJwt, obtenerMisReportes);

export default router;
