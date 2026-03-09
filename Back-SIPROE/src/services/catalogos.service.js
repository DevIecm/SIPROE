import { getCatalogFromDb } from "../repository/catalogos.repository.js";

export const catalogService = async (catalogo, options) => {
    const data = await getCatalogFromDb(catalogo, options);

    if (!data || data.length === 0) {
        throw new Error("No se encontraron datos");
    }

    return data;
};