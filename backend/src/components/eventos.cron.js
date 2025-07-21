import cron from 'node-cron';
import { eventos, modificarEvento } from '../services/eventos.services.js';

cron.schedule('0 1 * * *', async () => { // Todos los días a las 3:00 AM

  const lista = await eventos();
  const hoy = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    console.log("Ejecutando tarea programada para cerrar eventos pasados");
  for (const evento of lista) {
    
    if (evento.fecha < hoy && evento.estado !== 'cerrado') {
      await modificarEvento(evento.id, { ...evento, estado: 'cerrado' });
    }
  }
});
