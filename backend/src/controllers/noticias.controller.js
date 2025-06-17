import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { obtenerNoticiasUBB } from '../services/test_noticias.js';

export async function NoticiasController(req, res) {
  try {
    const noticias = await obtenerNoticiasUBB();
    res.json(noticias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error obteniendo noticias' });
  }
}