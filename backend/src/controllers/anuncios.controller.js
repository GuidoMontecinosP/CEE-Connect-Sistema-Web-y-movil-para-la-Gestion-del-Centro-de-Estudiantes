import { crearAnuncio, obtenerAnuncios, modificarAnuncio, eliminarAnuncio } from "../services/anuncios.service.js";
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

        const nuevoAnuncio = await crearAnuncio({
            titulo,
            epilogo,
            link,
            tipo
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

        const anuncioModificado = await modificarAnuncio(id, {
            titulo,
            epilogo,
            link,
            tipo,
            estado
        });

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

