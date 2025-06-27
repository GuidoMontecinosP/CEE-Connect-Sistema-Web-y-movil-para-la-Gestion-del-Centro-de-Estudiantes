import { Router } from "express";
import votacionesRoutes from "./votaciones.routes.js";
import usuarioRoutes from "./usuario.routes.js";
import authRoutes from "./auth.routes.js";

import eventosRouter from "./eventos.routes.js";

import { NoticiasController } from "../controllers/noticias.controller.js";

const router = Router();

router.use("/votacion", votacionesRoutes);
router.use("/auth", authRoutes);
router .use("/usuario", usuarioRoutes) // Rutas de usuario

//router.use("/auth", authRoutes);
//router.use("/usuarios", usuariosRoutes);

router.use("/eventos", eventosRouter);

router.get("/noticias", NoticiasController);

export default router;
