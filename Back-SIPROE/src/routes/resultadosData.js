import { connectToDatabase, sql } from '../ConfigServices/DatabaseConfiguration.js'
import verifyToken from '../ConfigServices/Midleware.js';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.get("/getProyectos", verifyToken, async (req, res) => {
    try{

        const { ut, distrito, tipo } = req.query;
        
        if(!ut || !distrito || !tipo){
            return res.status(400).json({ message: "Datos requeridos"})
        }

        const tipoNum = Number(tipo);
        const pool = await connectToDatabase();

        const result = await pool.request()
        .input('ut', sql.VarChar, ut)
        .input('distrito', sql.Int, distrito)
        .input('tipo', sql.Int, tipoNum)
        .query(`SELECT
                    u.clave_ut as clave,
                    u.ut as nombre_ut,
                    dt.dt as nombre_demarcacion,
                    s.fecha as fecha,
                    p.distrito as distrito,
                    ct.domicilio as domicilio,
                    p.folio,
                    p.nombre
                FROM proyectos p
                    JOIN unidad_territorial u ON p.ut = u.clave_ut
                    JOIN demarcacion_territorial dt ON u.demarcacion_territorial = dt.id
                    JOIN sorteo s on p.sorteo = s.id
                    JOIN cat_distrito ct ON p.distrito = ct.id 
                WHERE p.ut = @ut and p.distrito = @distrito and s.tipo = @tipo;
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