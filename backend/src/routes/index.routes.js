import { Router } from "express";
import votacionesRoutes from "./votaciones.routes.js";

import eventosRouter from "./eventos.routes.js";

import { NoticiasController } from "../controllers/noticias.controller.js";

const router = Router();

router.use("/votacion", votacionesRoutes);


// router.use("/auth", authRoutes);
// router.use("/usuarios", usuariosRoutes);

router.use("/eventos", eventosRouter);

router.get("/noticias", NoticiasController);

export default router;
