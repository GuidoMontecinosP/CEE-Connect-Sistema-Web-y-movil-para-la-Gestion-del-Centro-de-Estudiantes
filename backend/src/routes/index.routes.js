import { Router } from "express";
import votacionesRoutes from "./votaciones.routes.js";
import opcionesRoutes from "./opciones.routes.js";
import votosRoutes from "./votos.routes.js";



const router = Router();

router.use("/votaciones", votacionesRoutes);
router.use("/opciones", opcionesRoutes);
router.use("/votar", votosRoutes);

// router.use("/auth", authRoutes);
// router.use("/usuarios", usuariosRoutes);

export default router;
