import { Router } from "express";
import { emitirVoto } from "../controllers/votacionrespuesta.controller.js";

const router = Router();

router.post("/", emitirVoto); // Emitir un voto para una opción de votación siempre y cuando la votación esté activa y no haya sido votada por el usuario

export default router;
