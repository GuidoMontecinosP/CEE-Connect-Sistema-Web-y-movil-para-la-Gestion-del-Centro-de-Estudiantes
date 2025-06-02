import { Router } from "express";
import votacionesRoutes from "./votaciones.routes.js";



const router = Router();

router.use("/votacion", votacionesRoutes);


// router.use("/auth", authRoutes);
// router.use("/usuarios", usuariosRoutes);

export default router;
