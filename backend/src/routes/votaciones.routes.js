import express from 'express';
import {
  getVotaciones,
  createVotacion,
  getVotacionById,
  votar,
  verificarVoto,
  cerrarVotacionController,
  getResultados
} from '../controllers/votacion.controller.js';
import { authenticateJwt } from '../middlewares/authentication.middleware.js';
import { isAdmin } from '../middlewares/authorization.middleware.js';

const router = express.Router();

// Rutas de votaciones
router.get('/', getVotaciones);      //authenticateJwt,                       
router.post('/',authenticateJwt, isAdmin,createVotacion);                        
router.get('/:id', authenticateJwt, getVotacionById);                     
router.post('/:id/votar',authenticateJwt, votar);                         
router.get('/:id/mi-voto/:usuarioId', authenticateJwt, verificarVoto);     
router.patch('/:id/cerrar', authenticateJwt, isAdmin, cerrarVotacionController);     
router.get('/:id/resultados', authenticateJwt, getResultados);             

export default router;