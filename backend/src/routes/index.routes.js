import { Router } from "express";
import votacionesRoutes from "./votaciones.routes.js";
<<<<<<< HEAD
import usuarioRoutes from "./usuario.routes.js";
import authRoutes from "./auth.routes.js";
=======

import eventosRouter from "./eventos.routes.js";
>>>>>>> 32a0db2f24f8f6b38fb92c06e54afc7a0f0bd171

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
