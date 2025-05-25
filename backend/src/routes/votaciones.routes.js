import express from "express";
import {
  getVotaciones,
  crearVotacion,
    getVotacionPorId,
} from "../controllers/votaciones.controller.js";

const router = express.Router();

router.get("/", getVotaciones); // Obtener todas las votaciones
router.post("/", crearVotacion); // Crear una nueva votación 
router.get("/:id", getVotacionPorId); // Obtener una votación por ID

export default router;
