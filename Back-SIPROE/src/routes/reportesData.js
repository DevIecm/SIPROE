import { connectToDatabase, sql } from '../ConfigServices/DatabaseConfiguration.js'
import verifyToken from '../ConfigServices/Midleware.js';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.get("/getProyectosParticipantes", verifyToken, async (req, res) => {
    try {

        const pool = await connectToDatabase();

        const result = await pool.request()
            .query(`SELECT 
                    dt.dt as demarcacion,
                    u.ut as unidad_territorial,
                    u.clave_ut as clave,
                    p.numero_aleatorio as identificador,
                    p.folio as folio,
                    p.nombre,
                    p.distrito 
                FROM proyectos p
                    JOIN unidad_territorial u ON p.ut = u.clave_ut
                    JOIN demarcacion_territorial dt ON u.demarcacion_territorial = dt.id;`)

        if (result.recordset.length > 0) {
            return res.status(200).json({
                registrosProyectos: result.recordset
            });
        } else {
            return res.status(404).json({ message: "No se encontraron registros", code: 100})
        }

    } catch (error) {
        console.error("Error: ", error);
        return res.status(500).json({ message: "Error de servidor", error: error.message});
    }
});

router.get("/getProyectosCancelados", verifyToken, async (req, res) => {
    try {

        const pool = await connectToDatabase();

        const result = await pool.request()
            .query(`SELECT 
                    dt.dt as demarcacion,
                    u.clave_ut as clave,
                    u.ut as unidad_territorial,
                    s.fecha_eliminacion,
                    s.motivo,
                    s.numero_expediente_del,
                    oj.descripcion,
                    p.distrito 
                FROM proyectos p
                    JOIN unidad_territorial u ON p.ut = u.clave_ut
                    JOIN demarcacion_territorial dt ON u.demarcacion_territorial = dt.id
                    JOIN sorteo s ON p.sorteo = s.id
                    JOIN organo_jurisdiccional oj ON s.organo_jurisdiccional = oj.id
                WHERE s.estado = 2;`)

        if (result.recordset.length > 0) {
            return res.status(200).json({
                registrosProyectos: result.recordset
            });
        } else {
            return res.status(404).json({ message: "No se encontraron registros", code: 100})
        }

    } catch (error) {
        console.error("Error: ", error);
        return res.status(500).json({ message: "Error de servidor", error: error.message});
    }
});

router.get("/getProyectosAsignacion", verifyToken, async (req, res) => {
    try {
        const { ut, distrito, tipo } = req.query;
        
        if(!ut || !distrito || !tipo){
            return res.status(400).json({ message: "Datos requeridos"})
        }

        const tipoNum = Number(tipo);
        const pool = await connectToDatabase();

        const result = await pool.request()
            .query(`SELECT 
                    p.distrito as distrital,
                    dt.dt as demarcacion,
                    u.ut as unidad_territorial,
                    u.clave_ut as clave,
                    p.folio as folio,
                    p.numero_aleatorio as identificador,
                    p.nombre,
                    s.fecha_sentencia  as fecha_asignacion,
                    s.motivo,
                    s.numero_expediente_del,
                    oj.descripcion,
                    p.distrito 
                FROM proyectos p
                    JOIN unidad_territorial u ON p.ut = u.clave_ut
                    JOIN demarcacion_territorial dt ON u.demarcacion_territorial = dt.id
                    JOIN sorteo s ON p.sorteo = s.id
                    JOIN organo_jurisdiccional oj ON s.organo_jurisdiccional = oj.id
                WHERE s.tipo = 2;`)

        if (result.recordset.length > 0) {
            return res.status(200).json({
                registrosProyectos: result.recordset
            });
        } else {
            return res.status(404).json({ message: "No se encontraron registros", code: 100})
        }

    } catch (error) {
        console.error("Error: ", error);
        return res.status(500).json({ message: "Error de servidor", error: error.message});
    }
});

export default router;