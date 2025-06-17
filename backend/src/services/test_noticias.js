import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

export async function obtenerNoticiasUBB() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://noticias.ubiobio.cl/', { waitUntil: 'networkidle2' });
  // Espera extra para asegurar que el contenido dinámico cargue
  await new Promise(res => setTimeout(res, 2000));
  const html = await page.content();
  const $ = cheerio.load(html);

  const noticias = [];

  // Extrae la imagen, título y enlace de cada noticia (estructura real UBB)
  $('div.td-block-span6, div.td-block-span4, div.td_module_16, div.td_module_1, div.td_module_6, div.td_module_10, div.td_module_11').each((_, el) => {
    const enlace = $(el).find('a').first().attr('href');
    let titulo = $(el).find('a').first().text().trim();
    let imagen = $(el).find('img').first().attr('src') || $(el).find('img').first().attr('data-src');
    // Si la imagen es relativa, la convertimos a absoluta
    if (imagen && imagen.startsWith('/')) {
      imagen = 'https://noticias.ubiobio.cl' + imagen;
    }
    // Si no hay imagen, intenta buscar en el padre
    if (!imagen) {
      const parentImg = $(el).parent().find('img').first().attr('src') || $(el).parent().find('img').first().attr('data-src');
      if (parentImg && parentImg.startsWith('/')) {
        imagen = 'https://noticias.ubiobio.cl' + parentImg;
      } else if (parentImg) {
        imagen = parentImg;
      }
    }
    // Si el título está vacío, intenta obtener el atributo title
    if (!titulo) {
      titulo = $(el).find('img').first().attr('title') || $(el).find('a').first().attr('title') || '';
    }
    if (enlace && titulo) {
      noticias.push({
        titulo,
        enlace,
        imagen: imagen || null
      });
    }
  });

  // Si no se encontraron noticias con imagen, fallback al método anterior
  if (noticias.length === 0) {
    $('h5 a').each((_, el) => {
      noticias.push({
        titulo: $(el).text().trim(),
        enlace: $(el).attr('href'),
        imagen: null
      });
    });
  }

  // Si aún no hay imágenes, intentar obtener la imagen og:image de la página de la noticia (para las primeras 8)
  for (let i = 0; i < Math.min(noticias.length, 8); i++) {
    if (!noticias[i].imagen && noticias[i].enlace) {
      try {
        const noticiaTab = await browser.newPage();
        await noticiaTab.goto(noticias[i].enlace, { waitUntil: 'domcontentloaded', timeout: 60000 }); // timeout 60s
        const noticiaHtml = await noticiaTab.content();
        const $$ = cheerio.load(noticiaHtml);
        const ogImage = $$('meta[property="og:image"]').attr('content');
        if (ogImage) {
          noticias[i].imagen = ogImage;
        }
        await noticiaTab.close();
        // Pequeño delay entre cada carga (1s)
        await new Promise(res => setTimeout(res, 1000));
      } catch (e) {
        // Si falla, deja imagen en null
      }
    }
  }

  await browser.close();
  // Solo devolver las 8 noticias más recientes
  return noticias.slice(0, 8);
}

// Permite ejecutar el script directamente para debug
if (import.meta.url === `file://${process.argv[1]}`) {
  obtenerNoticiasUBB().then(noticias => {
    console.log('Noticias encontradas:', noticias.length);
    console.log(noticias.slice(0, 10));
  });
}