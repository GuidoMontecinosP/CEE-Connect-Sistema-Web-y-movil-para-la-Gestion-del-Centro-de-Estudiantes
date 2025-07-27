import { crearAnuncio, obtenerAnuncios, modificarAnuncio, eliminarAnuncio, obtenerAnuncioPorId } from "../services/anuncios.service.js";
import { crearAnuncioValidation, modificarAnuncioValidation } from "../validations/anuncio.validation.js";

export const CrearAnuncioController = async (req, res) => {
    
    const {error, value} = crearAnuncioValidation.validate(req.body);
    if (error) {
        console.log("Error de validación:", error.details);
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
            errors: error.details.map(detail => detail.message)
        });
    }

    try {
        const { titulo, epilogo, link, tipo } = value;
        const imagen = req.file ? `/SubirImagenes/${req.file.filename}` : null;

        const nuevoAnuncio = await crearAnuncio({
            titulo,
            epilogo,
            link,
            tipo,
            imagen
        });

        res.status(201).json({
            success: true,
            message: "Evento creado exitosamente",
            nuevoAnuncio,
        });

  } catch (error) {
    console.error("Error al crear el anuncio:", error);
    res.status(500).json({ mensaje: "Error interno al crear el anuncio" });
  }
};

export const ObtenerAnunciosController = async (req, res) => {
    try {
        
        const anuncios = await obtenerAnuncios();
        res.status(200).json(anuncios);

    } catch (error) {

        console.error("Error al obtener los anuncios:", error);
        res.status(500).json({ mensaje: "Error interno al obtener los anuncios" });
    }
}

export const ObtenerAnuncioPorIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const anuncio = await obtenerAnuncioPorId(id);

        if (!anuncio) {
            return res.status(404).json({ mensaje: "Anuncio no encontrado" });
        }

        res.status(200).json(anuncio);

    } catch (error) {
        console.error("Error al obtener el anuncio:", error);
        res.status(500).json({ mensaje: "Error interno al obtener el anuncio" });
    }
}

export const ModificarAnuncioController = async (req, res) => {
    const {error, value} = modificarAnuncioValidation.validate(req.body);
    if (error) {
        console.log("Error de validación:", error.details);
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
            errors: error.details.map(detail => detail.message)
        });
    }

    try {
        const { id } = req.params;
        const { titulo, epilogo, link, tipo, estado } = value;

        const datosActualizar =  {
            titulo,
            epilogo,
            link,
            tipo,
            estado
        };

        if (req.file) {
            datosActualizar.imagen = `/SubirImagenes/${req.file.filename}`;
        } else if (req.body.imagen) {
            // Si no hay archivo pero sí string, usar el path anterior
            datosActualizar.imagen = req.body.imagen;
        } else {
            // Si no hay imagen, asegúrate de que el campo exista (undefined)
            datosActualizar.imagen = undefined;
        }

        const anuncioModificado = await modificarAnuncio(id, datosActualizar);

        res.status(200).json({
            success: true,
            message: "Anuncio modificado exitosamente",
            anuncioModificado,
        });

    } catch (error) {
        console.error("Error al modificar el anuncio:", error);
        res.status(500).json({ mensaje: "Error interno al modificar el anuncio" });
    }
}

export const EliminarAnuncioController = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await eliminarAnuncio(id);

        res.status(200).json({
            success: true,
            message: resultado.message,
        });

    } catch (error) {
        console.error("Error al eliminar el anuncio:", error);
        res.status(500).json({ mensaje: "Error interno al eliminar el anuncio" });
    }
}

