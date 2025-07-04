import express from 'express';
import {
  getVotaciones,
  createVotacion,
  getVotacionById,
  votar,
  verificarVoto,
  cerrarVotacionController,
  getResultados,getParticipantes,putPublicarResultados
} from '../controllers/votacion.controller.js';
import { authenticateJwt } from '../middlewares/authentication.middleware.js';
import { isAdmin } from '../middlewares/authorization.middleware.js';

const router = express.Router();

// Rutas de votaciones
router.get('/', authenticateJwt,getVotaciones);      //authenticateJwt,                       
router.post('/',authenticateJwt,isAdmin,createVotacion);         //authenticateJwt,isAdmin,                
router.get('/:id', authenticateJwt,getVotacionById);                     // authenticateJwt,
router.post('/:id/votar', authenticateJwt,votar);                         //authenticateJwt,
router.get('/:id/mi-voto/:usuarioId',authenticateJwt, verificarVoto);    //  authenticateJwt,
router.patch('/:id/cerrar',  authenticateJwt,isAdmin,cerrarVotacionController);     //authenticateJwt, isAdmin,
router.get('/:id/resultados',authenticateJwt, getResultados);            

router.get('/:id/participantes',authenticateJwt,isAdmin, getParticipantes); //authenticateJwt, isAdmin,
router.put('/:id/publicar-resultados',authenticateJwt,isAdmin, putPublicarResultados ); //authenticateJwt, isAdmin,
export default router;