import express from 'express';
import {
  getVotaciones,
  createVotacion,
  getVotacionById,
  votar,
  verificarVoto,
  cerrarVotacionController,
  getResultados,getParticipantes
} from '../controllers/votacion.controller.js';
import { authenticateJwt } from '../middlewares/authentication.middleware.js';
import { isAdmin } from '../middlewares/authorization.middleware.js';

const router = express.Router();

// Rutas de votaciones
router.get('/', getVotaciones);      //authenticateJwt,                       
router.post('/',createVotacion);         //authenticateJwt,isAdmin,                
router.get('/:id', getVotacionById);                     // authenticateJwt,
router.post('/:id/votar', votar);                         //authenticateJwt,
router.get('/:id/mi-voto/:usuarioId', verificarVoto);    //  authenticateJwt,
router.patch('/:id/cerrar',  cerrarVotacionController);     //authenticateJwt, isAdmin,
router.get('/:id/resultados',getResultados);            
// comprobar si es que funciona para ver resultados siendo usuario o admin
//authenticateJwt, isAdmin,
router.get('/:id/participantes', getParticipantes); //authenticateJwt, isAdmin,
export default router;