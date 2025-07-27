import express from 'express';

import { crearEventoController, 
        modificarEventoController, 
        eventosController,
        eliminarEventoController,
        eventoPorIdController
} from '../controllers/eventos.controller.js';

import upload from '../middlewares/subirImagen.js';

import { authenticateJwt } from '../middlewares/authentication.middleware.js';
import { isAdmin } from '../middlewares/authorization.middleware.js';

const router = express.Router();
//recordar colocar restricciones a las rutas para despues
// Ruta para crear un evento
router.post('/crearEvento',authenticateJwt, isAdmin, upload.single('imagen'), crearEventoController);
// Ruta para modificar un evento
router.put('/modificarEvento/:id',authenticateJwt, isAdmin, upload.single('imagen'), modificarEventoController);
// Ruta para obtener todos los eventos
router.get('/eventos',authenticateJwt, eventosController);
// Ruta para eliminar un evento 
router.delete('/eliminarEvento/:id',authenticateJwt, isAdmin, eliminarEventoController);
// Ruta para obtener un evento por ID
router.get('/evento/:id',authenticateJwt, isAdmin, eventoPorIdController);

export default router;