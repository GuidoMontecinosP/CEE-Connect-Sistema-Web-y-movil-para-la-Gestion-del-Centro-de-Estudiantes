import express from "express";

import {
    CrearAnuncioController,
    ModificarAnuncioController,
    ObtenerAnunciosController,
    EliminarAnuncioController,
    ObtenerAnuncioPorIdController
} from "../controllers/anuncios.controller.js";

import upload from '../middlewares/subirImagen.js';

import { authenticateJwt } from '../middlewares/authentication.middleware.js';
import { isAdmin } from '../middlewares/authorization.middleware.js';

const router = express.Router();

// Ruta para crear un anuncio
router.post("/crearAnuncio",authenticateJwt, isAdmin, upload.single('imagen'), CrearAnuncioController);
// Ruta para modificar un anuncio
router.put("/modificarAnuncio/:id",authenticateJwt, isAdmin, upload.single('imagen'), ModificarAnuncioController);    
// Ruta para obtener todos los anuncios
router.get("/anuncios",authenticateJwt, ObtenerAnunciosController);
// Ruta para eliminar un anuncio
router.delete("/eliminarAnuncio/:id",authenticateJwt, isAdmin, EliminarAnuncioController);
// Ruta para obtener un anuncio por ID
router.get("/anuncio/:id",authenticateJwt, isAdmin, ObtenerAnuncioPorIdController);
export default router;