import { Router } from "express";
import { crearOpciones } from "../controllers/opciones.controller.js";

const router = Router();

router.post("/", crearOpciones); // Crear una nueva opción para una votación

export default router;
