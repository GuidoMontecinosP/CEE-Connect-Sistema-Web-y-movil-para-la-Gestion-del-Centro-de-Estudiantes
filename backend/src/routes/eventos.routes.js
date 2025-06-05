import express from 'express';

import { crearEventoController, modificarEventoController, eventosController } from '../controllers/eventos.controller.js';

const router = express.Router();
//recordar colocar restricciones a las rutas para despues
// Ruta para crear un evento
router.post('/crearEvento', crearEventoController);
// Ruta para modificar un evento
router.put('/modificarEvento/:id', modificarEventoController);
// Ruta para obtener todos los eventos
router.get('/eventos', eventosController);

export default router;