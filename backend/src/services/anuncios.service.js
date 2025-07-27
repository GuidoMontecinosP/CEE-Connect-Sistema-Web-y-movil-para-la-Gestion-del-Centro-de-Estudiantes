import { AppDataSource } from "../config/configDb.js";

const anuncioRepo = AppDataSource.getRepository("Anuncios");

export const crearAnuncio = async (datos) => {

    const { titulo, epilogo, link, tipo, imagen } = datos;

    const nuevoAnuncio = anuncioRepo.create({
        titulo,
        epilogo,
        link,
        tipo,
        estado: true, // Por defecto, el anuncio está activo
        imagen
    }); 

    return await anuncioRepo.save(nuevoAnuncio);      
};

export const obtenerAnuncios = async () => {

    const anuncios = await anuncioRepo.find({
        where: { estado: true },
        order: {
            fechaPublicacion: "DESC" // Ordenar por fecha de publicación descendente
        }
    });
    return anuncios;
}

export const obtenerAnuncioPorId = async (id) => {

    const anuncio = await anuncioRepo.findOneBy({ id });
    if (!anuncio) throw new Error("Anuncio no encontrado");
    
    return anuncio;
}

export const modificarAnuncio = async (id, datos) => {

    const anuncio = await anuncioRepo.findOneBy({ id });
    if (!anuncio) throw new Error("Anuncio no encontrado");

    const { titulo, epilogo, link, tipo, imagen } = datos;

    anuncio.titulo = titulo || anuncio.titulo;
    anuncio.epilogo = epilogo || anuncio.epilogo;  
    anuncio.link = link || anuncio.link;
    anuncio.tipo = tipo || anuncio.tipo;
    anuncio.estado = anuncio.estado;
    anuncio.imagen = imagen || anuncio.imagen

    return await anuncioRepo.save(anuncio);
}

export const eliminarAnuncio = async (id) => {
    try {
        const resultado = await anuncioRepo.delete(id);
        if (resultado.affected === 0) {
            throw new Error("Anuncio no encontrado o ya ha sido eliminado");
        }

        return { message: "Anuncio eliminado exitosamente" };

    } catch (error) {
        console.error("Error al eliminar el anuncio:", error.message);
        throw new Error("Error al eliminar el anuncio");
    }
}
