import { connectToDatabase, sql } from '../ConfigServices/DatabaseConfiguration.js'
import Midleware from '../ConfigServices/Midleware.js';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.get("/getProyectos", Midleware.verifyToken, async (req, res) => {
    try{

        const { ut, distrito, tipo, anio } = req.query;
        
        if(!ut || !distrito || !tipo || !anio){
            return res.status(400).json({ message: "Datos requeridos"})
        }

        const tipoNum = Number(tipo);
        const pool = await connectToDatabase();

        const result = await pool.request()
        .input('ut', sql.VarChar, ut)
        .input('distrito', sql.Int, distrito)
        .input('tipo', sql.Int, tipoNum)
        .input('anio', sql.Int, anio)
        .query(`SELECT
                    u.clave_ut as clave,
                    u.ut as nombre_ut,
                    dt.dt as nombre_demarcacion,
                    s.fecha as fecha,
                    p.distrito as distrito,
                    ct.domicilio as domicilio,
                    p.folio,
                    p.nombre,
                    ct.nombre_sod as sod,
	                ct.nombre_tod  as tod,
                    s.fecha_sentencia as fecha_sentencia,
	                s.numero_expediente as numero_expediente,
                    p.numero_aleatorio,
                    p.anio,
                    s.id_motivo 
                FROM proyectos p
                    JOIN unidad_territorial u ON p.ut = u.clave_ut
                    JOIN demarcacion_territorial dt ON u.demarcacion_territorial = dt.id
                    JOIN sorteo s on p.sorteo = s.id
                    JOIN cat_distrito ct ON p.distrito = ct.id 
                WHERE p.ut = @ut and p.distrito = @distrito and s.tipo = @tipo and p.anio = @anio
                ORDER BY numero_aleatorio ASC;
            `)
        
        if (result.recordset.length > 0) {
            return res.status(200).json({
                registrosProyectos: result.recordset
            });
        } else {
            return res.status(404).json({ message: "No se encontraron registros", code: 100})
        }
        

    } catch (err) {
        console.error("Error: ", error);
        return res.status(500).json({ message: "Error de servidor", error: error.message});
    }
})

router.get("/getProyectosFull", Midleware.verifyToken, async (req, res) => {
    try{

        const { ut } = req.query;
        
        if(!ut){
            return res.status(400).json({ message: "Datos requeridos"})
        }

        const pool = await connectToDatabase();

        const result = await pool.request()
        .input('ut', sql.VarChar, ut)
        .query(`SELECT 
                    p.numero_aleatorio as identificador, 
                    p.folio as folio, 
                    p.nombre as nombre, 
                    p.descripcion as descripcion,
                    u.clave_ut as clave,
	                u.ut as nombre_ut,
                    p.anio
                FROM proyectos p 
                    JOIN unidad_territorial u ON p.ut = u.clave_ut
                WHERE p.ut = @ut ORDER BY numero_aleatorio ASC;
            `)
        
        if (result.recordset.length > 0) {
            return res.status(200).json({
                registrosProyectos: result.recordset
            });
        } else {
            return res.status(404).json({ message: "No se encontraron registros", code: 100})
        }
        

    } catch (err) {
        console.error("Error: ", error);
        return res.status(500).json({ message: "Error de servidor", error: error.message});
    }
})

export default router;