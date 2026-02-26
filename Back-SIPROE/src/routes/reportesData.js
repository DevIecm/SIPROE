import { connectToDatabase, sql } from '../ConfigServices/DatabaseConfiguration.js'
import Midleware from '../ConfigServices/Midleware.js';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.get("/getProyectosParticipantes", Midleware.verifyToken, async (req, res) => {
    try {

        const { idDistrito, tipoUsuario } = req.query;
        
        if(!idDistrito || !tipoUsuario){
            return res.status(400).json({ message: "Datos requeridos"})
        }

        if(tipoUsuario == 2){

            const pool = await connectToDatabase();

            const result = await pool.request()
                .input('idDistrito', sql.Int, idDistrito)
                .query(`SELECT 
                        dt.dt as demarcacion,
                        u.ut as unidad_territorial,
                        u.clave_ut as clave,
                        p.numero_aleatorio as identificador,
                        p.folio as folio,
                        p.nombre,
                        p.distrito,
                        p.anio
                    FROM proyectos p
                        JOIN unidad_territorial u ON p.ut = u.clave_ut
                        JOIN demarcacion_territorial dt ON u.demarcacion_territorial = dt.id
                    WHERE anio IN(2026, 2027)
                    ORDER p.anio, p.ut, p.numero_aleatorio ASC;`)

            if (result.recordset.length > 0) {
                return res.status(200).json({
                    registrosProyectosParticipantes: result.recordset
                });
            } else {
                return res.status(404).json({ message: "No se encontraron registros", code: 100})
            }

        } else {

            const pool = await connectToDatabase();

            const result = await pool.request()
                .input('idDistrito', sql.Int, idDistrito)
                .query(`SELECT 
                        dt.dt as demarcacion,
                        u.ut as unidad_territorial,
                        u.clave_ut as clave,
                        p.numero_aleatorio as identificador,
                        p.folio as folio,
                        p.nombre,
                        p.distrito,
                        p.anio
                    FROM proyectos p
                        JOIN unidad_territorial u ON p.ut = u.clave_ut
                        JOIN demarcacion_territorial dt ON u.demarcacion_territorial = dt.id
                    WHERE anio IN(2026, 2027) and p.distrito = @idDistrito
                    ORDER BY p.anio, p.ut ASC;`)

            if (result.recordset.length > 0) {
                return res.status(200).json({
                    registrosProyectosParticipantes: result.recordset
                });
            } else {
                return res.status(404).json({ message: "No se encontraron registros", code: 100})
            }

        }

    } catch (error) {
        console.error("Error: ", error);
        return res.status(500).json({ message: "Error de servidor", error: error.message});
    }
});

router.get("/getProyectosCancelados", Midleware.verifyToken, async (req, res) => {
    try {

        const { idDistrito, tipoUsuario } = req.query;
        
        if(!idDistrito || !tipoUsuario){
            return res.status(400).json({ message: "Datos requeridos"})
        }

        if(tipoUsuario == 2){
            
            const pool = await connectToDatabase();

            const result = await pool.request()
                .input('idDistrito', sql.Int, idDistrito)
                .query(`SELECT 
                            dt.dt as demarcacion,
                            u.clave_ut as clave,
                            u.ut as unidad_territorial,
                            s.fecha_eliminacion,
                            s.motivo_del,
                            s.numero_expediente_del,
                            oj.descripcion,
                            s.clave_ut,
                            s.id,
                            s.clave_ut 
                        FROM sorteo s
                            JOIN unidad_territorial u ON s.clave_ut = u.clave_ut
                            JOIN demarcacion_territorial dt ON u.demarcacion_territorial = dt.id
                            JOIN organo_jurisdiccional oj ON s.organo_jurisdiccional_del = oj.id
                        WHERE s.estado = 2
                        ORDER BY s.clave_ut ASC;`)

            if (result.recordset.length > 0) {
                return res.status(200).json({
                    registrosProyectosCancelados: result.recordset
                });
            } else {
                return res.status(404).json({ message: "No se encontraron registros", code: 100})
            }

        } else {
            const pool = await connectToDatabase();

            const result = await pool.request()
                .input('idDistrito', sql.Int, idDistrito)
                .query(`SELECT DISTINCT
                            dt.dt as demarcacion,
                            u.clave_ut as clave,
                            u.ut as unidad_territorial,
                            s.fecha_eliminacion,
                            s.motivo_del,
                            s.numero_expediente_del,
                            oj.descripcion,
                            s.clave_ut,
                            s.id,
                            s.clave_ut 
                        FROM sorteo s
                            JOIN unidad_territorial u ON s.clave_ut = u.clave_ut
                            JOIN demarcacion_territorial dt ON u.demarcacion_territorial = dt.id
                            JOIN organo_jurisdiccional oj ON s.organo_jurisdiccional_del = oj.id
                            JOIN proyectos p ON s.clave_ut = p.ut
                        WHERE s.estado = 2 and p.distrito = @idDistrito
                        ORDER BY s.clave_ut ASC;`)

            if (result.recordset.length > 0) {
                return res.status(200).json({
                    registrosProyectosCancelados: result.recordset
                });
            } else {
                return res.status(404).json({ message: "No se encontraron registros", code: 100})
            }
        }

    } catch (error) {
        console.error("Error: ", error);
        return res.status(500).json({ message: "Error de servidor", error: error.message});
    }
});

router.get("/getProyectosAsignacion", Midleware.verifyToken, async (req, res) => {
    try {

        const { idDistrito, tipoUsuario } = req.query;
        
        if(!idDistrito || !tipoUsuario){
            return res.status(400).json({ message: "Datos requeridos"})
        }
        
        if(tipoUsuario == 2) {

            const pool = await connectToDatabase();

            const result = await pool.request()
                .input('idDistrito', sql.Int, idDistrito)
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
                        s.numero_expediente,
                        oj.descripcion,
                        s.fecha,
                        p.distrito 
                    FROM proyectos p
                        JOIN unidad_territorial u ON p.ut = u.clave_ut
                        JOIN demarcacion_territorial dt ON u.demarcacion_territorial = dt.id
                        JOIN sorteo s ON p.sorteo = s.id
                        JOIN organo_jurisdiccional oj ON s.organo_jurisdiccional = oj.id
                    WHERE s.tipo = 2 
                    ORDER BY p.ut ASC;`)

            if (result.recordset.length > 0) {
                return res.status(200).json({
                    registrosProyectosAsignacion: result.recordset
                });
            } else {
                return res.status(404).json({ message: "No se encontraron registros", code: 100})
            }

        } else {
            const pool = await connectToDatabase();

            const result = await pool.request()
                .input('idDistrito', sql.Int, idDistrito)
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
                        s.numero_expediente,
                        oj.descripcion,
                        s.fecha,
                        p.distrito 
                    FROM proyectos p
                        JOIN unidad_territorial u ON p.ut = u.clave_ut
                        JOIN demarcacion_territorial dt ON u.demarcacion_territorial = dt.id
                        JOIN sorteo s ON p.sorteo = s.id
                        JOIN organo_jurisdiccional oj ON s.organo_jurisdiccional = oj.id
                    WHERE s.tipo = 2 and p.distrito = @idDistrito
                    ORDER BY p.ut ASC;`)

            if (result.recordset.length > 0) {
                return res.status(200).json({
                    registrosProyectosAsignacion: result.recordset
                });
            } else {
                return res.status(404).json({ message: "No se encontraron registros", code: 100})
            }
        }

    } catch (error) {
        console.error("Error: ", error);
        return res.status(500).json({ message: "Error de servidor", error: error.message});
    }
});

export default router;