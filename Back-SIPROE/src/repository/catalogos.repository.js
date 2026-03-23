import { pool, poolConnect } from "../ConfigServices/DatabaseConfiguration.js";

const queries = {
    catMotivo: `SELECT 
                    cm.id, 
                    cm.motivo 
                FROM cat_motivo cm`,

    catOrgano: `SELECT * FROM organo_jurisdiccional ut`,

    catTipoSorteo: `SELECT DISTINCT ts.descripcion, s.tipo FROM tipo_sorteo ts 
                        JOIN sorteo s ON ts.id = s.tipo 
                        JOIN proyectos p ON s.id = p.sorteo`,
    
    catUnidad: `SELECT 
                    ut.id, 
                    ut.clave_ut, 
                    ut.ut, 
                    ut.distrito, 
                    ut.demarcacion_territorial, 
                    dt.dt as dt, 
                    dt.id as idDt 
                FROM unidad_territorial ut 
                JOIN demarcacion_territorial dt ON ut.demarcacion_territorial = dt.id`,

    catUnidadFilter: `SELECT DISTINCT
                        ut.id, 
                        ut.clave_ut, 
                        ut.ut, 
                        ut.distrito, 
                        ut.demarcacion_territorial, 
                        dt.dt AS dt, 
                        dt.id AS idDt
                    FROM unidad_territorial ut
                        JOIN demarcacion_territorial dt ON ut.demarcacion_territorial = dt.id
                        JOIN proyectos p ON LOWER(ut.clave_ut) = LOWER(p.ut)
                        JOIN sorteo s ON p.sorteo = s.id`,

    catunidadFilterSorteo: `SELECT DISTINCT 
                                p.UT,
                                ut.id AS id_ut,
                                ut.clave_ut,
                                ut.ut,
                                p.distrito 
                            FROM proyectos p
                                JOIN unidad_territorial ut on ut.clave_ut = p.ut
                            WHERE p.UT IN (
                                SELECT 
                                p2.UT
                                FROM proyectos p2`,

    catunidadFilterSorteoAnio: `SELECT DISTINCT 
                                p.UT,
                                ut.id AS id_ut,
                                ut.clave_ut,
                                ut.ut,
                                p.distrito 
                            FROM proyectos p
                                JOIN unidad_territorial ut on ut.clave_ut = p.ut
                            WHERE p.UT IN (
                                SELECT 
                                p2.UT
                                FROM proyectos p2`
}

export const getCatalogFromDb = async (catalogo, options = {}) => {
    if (!queries[catalogo]) throw new Error("Catálogo no válido");

    await poolConnect;
    let request = pool.request();

    if (catalogo === "catTipoSorteo" && options.ut) {
        request.input("ut", options.ut);
        return (await request.query(`${queries[catalogo]} WHERE p.ut = @ut`)).recordset;

    } else if(catalogo === "catUnidad" && options.idDistrito) {
        request.input("idDistrito", options.idDistrito);
        return (await request.query(`${queries[catalogo]} WHERE ut.distrito = @idDistrito`)).recordset;

    } else if(catalogo === "catUnidadFilter" && options.idDistrito) {
        request.input("idDistrito", options.idDistrito);
        return (await request.query(`${queries[catalogo]} WHERE ut.distrito = @idDistrito`)).recordset;

    } else if(catalogo === "catunidadFilterSorteo" && options.idDistrito) {
        request.input("idDistrito", options.idDistrito);
        return (await request.query(`${queries[catalogo]} WHERE p.distrito = @idDistrito and p2.sorteo IS NOT NULL and p2.anio = p.anio) AND (p.sorteo IS NULL OR p.numero_aleatorio IS NULL)`)).recordset;

    } else if(catalogo === "catunidadFilterSorteoAnio" && options.idDistrito && options.anio) {
        request.input("idDistrito", options.idDistrito);
        request.input("anio", options.anio)
        return (await request.query(`${queries[catalogo]} WHERE p.distrito = @idDistrito and p2.sorteo IS NOT NULL AND p2.anio = @anio) AND (p.sorteo IS NULL OR p.numero_aleatorio IS NULL)`)).recordset;
    }

    const result = await request.query(queries[catalogo]);
    return result.recordset;
};