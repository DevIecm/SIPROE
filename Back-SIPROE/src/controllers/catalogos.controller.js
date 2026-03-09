import { catalogService } from "../services/catalogos.service.js"

export const getCatalogo = async (req, res) => {
    try {
        const { catalogo } = req.params;
        const options = {};

        if(catalogo === "catTipoSorteo" && req.query.ut) {
            options.ut = req.query.ut;
        } else if(catalogo === "catUnidad" && req.query.idDistrito) {
            options.idDistrito = req.query.idDistrito;
        }
        else if(catalogo === "catUnidadFilter" && req.query.idDistrito) {
            options.idDistrito = req.query.idDistrito;
        }
        else if(catalogo === "catunidadFilterSorteo" && req.query.idDistrito) {
            options.idDistrito = req.query.idDistrito;
        }

        const result = await catalogService(catalogo, options);

        res.status(200).json({ catalogo, data: result });
    } catch (error) {
        if (error.message === "Catálogo no válido") {
            return res.status(400).json({ message: error.message });
        }
        if (error.message === "No se encontraron datos") {
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({ message: "Error de servidor", error: error.message });
    }
}; 