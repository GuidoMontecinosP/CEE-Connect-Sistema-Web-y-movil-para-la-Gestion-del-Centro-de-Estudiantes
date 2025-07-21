import express from "express";

import {
    CrearAnuncioController,
    ModificarAnuncioController,
    ObtenerAnunciosController,
    EliminarAnuncioController
} from "../controllers/anuncios.controller.js";

import { authenticateJwt } from '../middlewares/authentication.middleware.js';
import { isAdmin } from '../middlewares/authorization.middleware.js';

const router = express.Router();

// Ruta para crear un anuncio
router.post("/crearAnuncio",authenticateJwt, isAdmin, CrearAnuncioController);
// Ruta para modificar un anuncio
router.put("/modificarAnuncio/:id",authenticateJwt, isAdmin, ModificarAnuncioController);    
// Ruta para obtener todos los anuncios
router.get("/anuncios",authenticateJwt, ObtenerAnunciosController);
// Ruta para eliminar un anuncio
router.delete("/eliminarAnuncio/:id",authenticateJwt, isAdmin, EliminarAnuncioController);

export default router;