import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';

const CACHE_PATH = path.resolve('./cache_noticias_ubb.json');
const CACHE_EXPIRACION_MS = 2 * 60 * 60 * 1000; //ver si se deja por mas tiempo  o no por ahora solo 2 horas

export async function obtenerNoticiasUBB() {
  // Verificar caché
  try {
    const contenido = await fs.readFile(CACHE_PATH, 'utf-8');
    const { timestamp, noticias } = JSON.parse(contenido);
    if (Date.now() - timestamp < CACHE_EXPIRACION_MS) {
      console.log('✅ Cargando noticias desde caché');
      return noticias;
    }
  } catch (e) {
    // No hay caché o está corrupta
  }

  console.log('🌐 Realizando scraping de noticias UBB...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://noticias.ubiobio.cl/', { waitUntil: 'networkidle2' });
  await new Promise(res => setTimeout(res, 2000));
  const html = await page.content();
  const $ = cheerio.load(html);

  const noticias = [];

  $('div.td-block-span6, div.td-block-span4, div.td_module_16, div.td_module_1, div.td_module_6, div.td_module_10, div.td_module_11').each((_, el) => {
    const enlace = $(el).find('a').first().attr('href');
    let titulo = $(el).find('a').first().text().trim();
    if (!titulo) {
      titulo = $(el).find('img').first().attr('title') || $(el).find('a').first().attr('title') || '';
    }
    if (enlace && titulo) {
      noticias.push({
        titulo,
        enlace,
        imagen: null
      });
    }
  });

  // Si no encontró nada, intentar fallback
  if (noticias.length === 0) {
    $('h5 a').each((_, el) => {
      noticias.push({
        titulo: $(el).text().trim(),
        enlace: $(el).attr('href'),
        imagen: null
      });
    });
  }

  // Obtener og:image en paralelo (máximo 3 noticias)
  const promesas = noticias.slice(0, 3).map(async (noticia, i) => {
    try {
      const tab = await browser.newPage();
      await tab.goto(noticia.enlace, { waitUntil: 'domcontentloaded', timeout: 60000 });
      const noticiaHtml = await tab.content();
      const $$ = cheerio.load(noticiaHtml);
      const ogImage = $$('meta[property="og:image"]').attr('content');
      if (ogImage) {
        noticias[i].imagen = ogImage;
      }
      await tab.close();
    } catch (e) {
      // No hacer nada si falla
    }
  });

  await Promise.all(promesas);
  await browser.close();

  const noticiasFinales = noticias.slice(0, 3);

  // Guardar en caché
  await fs.writeFile(CACHE_PATH, JSON.stringify({
    timestamp: Date.now(),
    noticias: noticiasFinales
  }), 'utf-8');

  return noticiasFinales;
}

// Permitir ejecución directa del script
if (import.meta.url === `file://${process.argv[1]}`) {
  obtenerNoticiasUBB().then(noticias => {
    console.log('📰 Noticias encontradas:', noticias.length);
    console.log(noticias);
  });
}