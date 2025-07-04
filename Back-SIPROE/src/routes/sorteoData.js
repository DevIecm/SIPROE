import { connectToDatabase, sql } from '../ConfigServices/DatabaseConfiguration.js'
import Midleware from '../ConfigServices/Midleware.js';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.get("/getSorteos", Midleware.verifyToken, async (req, res) => {
    try {
        const { ut, distrito } = req.query;
        
        if(!ut || !distrito){
            return res.status(400).json({ message: "Datos requeridos"})
        }

        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('ut', sql.VarChar, ut)
            .input('distrito', sql.Int, distrito)
            .query(`
                SELECT 
                    p.id,
                    p.nombre,
                    p.folio,
                    p.numero_aleatorio,
                    p.dictamen,
                    p.distrito,
                    p.sorteo,
                    p.anio,
                    p.ut,
                    COUNT(*) OVER() AS aprobados,
                    SUM(CASE WHEN p.sorteo IS NULL OR p.sorteo = '' THEN 1 ELSE 0 END) OVER() AS sortear,
                    SUM(CASE WHEN p.sorteo IS NOT NULL AND p.sorteo <> '' THEN 1 ELSE 0 END) OVER() AS sorteados
                FROM proyectos p WHERE p.ut = @ut and p.distrito = @distrito;`
            )

        if (result.recordset.length > 0) {
            return res.status(200).json({
                registrosProyectos: result.recordset
            });
        } else {
            return res.status(404).json({ message: "No se encontraron registros", code: 100})
        }
    } catch (error) {
        console.error("Error: ", error);
        return res.status(500).json({ message: "Error de servidor", error: error.message0});
    }
});

router.post("/insertaSorteo", Midleware.verifyToken, async (req, res) => {
    try{
        const { clave_ut, fecha } = req.body;
        
        if(!clave_ut || !fecha){
            return res.status(400).json({ message: "Datos requeridos"})
        }

        const original = new Date(fecha);

        const offsetInMs = original.getTimezoneOffset() * 60000;
        const fechaLocal = new Date(original.getTime() - offsetInMs);

        const pool = await connectToDatabase();

        const result = await pool.request()
            .input('clave_ut', sql.VarChar, clave_ut)
            .input('fecha', sql.DateTime, fechaLocal)
            .query(`INSERT INTO sorteo (tipo, estado, fecha, clave_ut)
              OUTPUT INSERTED.id
              VALUES (1, 1, @fecha, @clave_ut)`);

        const insertedId = result.recordset[0].id;

        return res.status(200).json({
        message: "Registro creado correctamente",
        id: insertedId,
        code: 200,
        });
            
    } catch(err) {
        console.error(err);
        return res.status(500).json({ message: "Error de servidor", err})
    }
});

router.delete("/deleteSorteo", Midleware.verifyToken, async (req, res) => {
    try{

        const { id } = req.query;

        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`UPDATE 
                sorteo SET estado = 2 WHERE id = @id;`);

        return res.status(200).json({
            message: "Registro eliminado correctamente",
            code: 200,
            id: id
        });
            
    } catch(err) {
        console.error(err);
        return res.status(500).json({ message: "Error de servidor", err})
    }
});

router.patch("/actualizaProyecto", Midleware.verifyToken, async (req, res) => {
    try {

        const { folio, numero_aleatorio, sorteo } = req.body;

        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('folio', sql.VarChar, folio)
            .input('numero_aleatorio', sql.Int, numero_aleatorio)
            .input('sorteo', sql.Int, sorteo)
            .query(`UPDATE 
                proyectos SET numero_aleatorio = @numero_aleatorio , sorteo = @sorteo 
                WHERE folio = @folio;
            `);
        
            return res.status(200).json({ message: "Registro actualizado correctamente", code: 200 });

    } catch(err) {
        console.error(err);
        return res.status(500).json({ message: "Error de servidor", err})
    }
})

router.patch("/actualizaToDelete", Midleware.verifyToken, async (req, res) => {
    try {

        const { sorteo } = req.body;
        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('sorteo', sql.Int, sorteo)
            .query(`UPDATE 
                        proyectos SET numero_aleatorio = null, sorteo = null 
                    WHERE sorteo = @sorteo;`)
            
            return res.status(200).json({ message: "Registro actualizado correctamente", code: 200 });

    } catch(err) {
        console.error(err);
        return res.status(500).json({ message: "Error del servidor", err})
    }
})

export default router;