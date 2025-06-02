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

const router = express.Router();

// Rutas de votaciones
router.get('/', getVotaciones);                           
router.post('/', createVotacion);                        
router.get('/:id', getVotacionById);                     
router.post('/:id/votar', votar);                         
router.get('/:id/mi-voto/:usuarioId', verificarVoto);     
router.patch('/:id/cerrar', cerrarVotacionController);     
router.get('/:id/resultados', getResultados);             

export default router;