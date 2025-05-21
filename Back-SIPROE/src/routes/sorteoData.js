const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const verifyToken = require("../ConfigServices/Midleware");
const { connectToDatabase, sql } = require('../ConfigServices/DatabaseConfiguration')
require('dotenv').config();

router.get("/getSorteos", verifyToken, async (req, res) => {
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

router.post("/insertaSorteo", verifyToken, async (req, res) => {
    try{
        const pool = await connectToDatabase();
        const result = await pool.request()
            .query(`INSERT INTO sorteo (tipo, estado, fecha)
              OUTPUT INSERTED.id
              VALUES (1, 1, GETDATE())`);

        const insertedId = result.recordset[0].id;

        return res.status(200).json({
        message: "Registro creado correctamente",
        id: insertedId,
        code: 200,
        });
            
    } catch(err) {
        console.error(error);
        return res.status(500).json({ message: "Error de servidor", error})
    }
});

router.delete("/deleteSorteo", verifyToken, async (req, res) => {
    try{

        const { id } = req.query;

        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`DELETE FROM sorteo WHERE id = @id`);


        return res.status(200).json({
            message: "Registro eliminado correctamente",
            code: 200,
        });
            
    } catch(err) {
        console.error(err);
        return res.status(500).json({ message: "Error de servidor", err})
    }
});

router.patch("/actualizaProyecto", verifyToken, async (req, res) => {
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

router.patch("/actualizaToDelete", verifyToken, async (req, res) => {
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

module.exports = router;